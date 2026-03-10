# CloudFront/S3 Configuration for Next.js Static Export

## Problem
The current deployment is experiencing MIME type errors because CloudFront is returning HTML (404 page) instead of JavaScript files for static assets.

## Root Cause
When a Next.js static export is deployed to S3/CloudFront, the routing must be configured to:
1. Serve static assets from `/_next/static/*` directly
2. Handle HTML5 pushState routing for pages

## Required CloudFront Configuration

### 1. Error Pages Configuration
Configure CloudFront to handle 404 errors properly:

- **404 Error Response**:
  - HTTP Response Code: 200
  - Response Page Path: `/404.html`
  - TTL: 300 seconds

- **403 Error Response** (S3 returns 403 for missing files):
  - HTTP Response Code: 200
  - Response Page Path: `/404.html`
  - TTL: 300 seconds

### 2. Behaviors (in priority order)

#### Behavior 1: Static Assets (Highest Priority)
- **Path Pattern**: `/_next/*`
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed HTTP Methods**: GET, HEAD, OPTIONS
- **Cache Policy**: CachingOptimized (or custom with long TTL)
- **Compress Objects**: Yes
- **Response Headers Policy**: CORS-with-preflight-and-SecurityHeadersPolicy

#### Behavior 2: Default (*)
- **Path Pattern**: `*` (Default)
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed HTTP Methods**: GET, HEAD, OPTIONS
- **Cache Policy**: CachingDisabled (or custom with short TTL for HTML)
- **Compress Objects**: Yes
- **Function Associations**:
  - Viewer Request: (Optional) Add index.html rewrite function

### 3. CloudFront Function for Directory Rewrite (Optional but Recommended)

Create a CloudFront Function to handle directory requests:

```javascript
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Check if URI ends with '/' and append 'index.html'
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // Check if URI is missing an extension and doesn't end with '/'
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }
    
    return request;
}
```

Associate this function with the Default behavior's **Viewer Request**.

## S3 Bucket Configuration

1. **Bucket Policy**: Allow CloudFront OAI to read
2. **Static Website Hosting**: Disabled (use CloudFront origin)
3. **Block Public Access**: Keep enabled (access via CloudFront only)

## Deployment Checklist

After deploying new code:

1. ✅ Build the project: `npm run build:dev` or `npm run build:prod`
2. ✅ Upload `out/` directory contents to S3 bucket
3. ✅ Ensure `_next/` folder is uploaded with correct structure
4. ✅ Invalidate CloudFront cache: `/*` and `/_next/*`
5. ✅ Test all routes including policy pages
6. ✅ Verify static assets load correctly (check browser console)

## Testing Commands

After deployment, test these URLs:
```bash
# Test static assets (should return JavaScript, not HTML)
curl -I https://dev.arjunasarrow.in/_next/static/chunks/framework.js

# Test page routing
curl -I https://dev.arjunasarrow.in/dashboard/
curl -I https://dev.arjunasarrow.in/contact/
curl -I https://dev.arjunasarrow.in/privacy-policy/

# Verify MIME types
curl -s -I https://dev.arjunasarrow.in/_next/static/chunks/main.js | grep -i content-type
# Should return: content-type: application/javascript
```

## Quick Fix (Immediate)

If you need an immediate fix:

1. **Invalidate CloudFront Cache**:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DISTRIBUTION_ID \
     --paths "/*"
   ```

2. **Verify S3 Upload**: Ensure the `_next/` folder exists in your S3 bucket with the correct structure

3. **Check Behavior Order**: In CloudFront, make sure `/_next/*` behavior has higher priority than the default behavior

## Alternative: Use Next.js Server

If static export continues to have issues, consider:
- Deploying to Vercel (optimized for Next.js)
- Using AWS Amplify (handles Next.js automatically)
- Running Next.js server on AWS App Runner or ECS

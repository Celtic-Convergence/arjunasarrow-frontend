# Deployment Issue Fix - MIME Type Error

## Issue Summary
After deployment to CloudFront/S3, the application shows errors:
```
Refused to execute script from 'https://dev.arjunasarrow.in/_next/static/chunks/2266-b78a5ff09e2c1c6b.js' 
because its MIME type ('text/html') is not executable
```

## Root Cause
CloudFront is returning HTML (404 page) instead of JavaScript files because:
1. The `/_next/static/*` files are not found on S3
2. OR CloudFront is not configured to serve static assets properly
3. OR The content-type headers are incorrect

## Solution Steps

### Step 1: Update and Rebuild
✅ **COMPLETED** - Updated `next.config.js` to remove problematic `exportPathMap`
```bash
npm run build:dev
```

### Step 2: Deploy to S3 with Correct Headers

#### Option A: Using the Deployment Script (Recommended)
1. Edit `deploy-to-s3.ps1` and update:
   - `$S3_BUCKET` with your bucket name
   - `$CLOUDFRONT_DISTRIBUTION_ID` with your distribution ID
   - `$AWS_PROFILE` if needed

2. Run the script:
```powershell
.\deploy-to-s3.ps1
```

#### Option B: Manual Deployment
```bash
# 1. Upload HTML files (no cache)
aws s3 sync out/ s3://dev.arjunasarrow.in/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html" \
  --delete

# 2. Upload static assets (long cache)
aws s3 sync out/_next/ s3://dev.arjunasarrow.in/_next/ \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

# 3. Fix JavaScript MIME types
aws s3 cp s3://dev.arjunasarrow.in/_next/ s3://dev.arjunasarrow.in/_next/ \
  --recursive \
  --exclude "*" \
  --include "*.js" \
  --content-type "application/javascript" \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000, immutable"

# 4. Fix CSS MIME types
aws s3 cp s3://dev.arjunasarrow.in/_next/ s3://dev.arjunasarrow.in/_next/ \
  --recursive \
  --exclude "*" \
  --include "*.css" \
  --content-type "text/css" \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000, immutable"

# 5. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Step 3: Configure CloudFront (Critical)

See `CLOUDFRONT_SETUP.md` for detailed CloudFront configuration.

**Quick checklist:**
1. ✅ Add behavior for `/_next/*` with higher priority than default
2. ✅ Configure 404/403 error pages to return `/404.html` with 200 status
3. ✅ Set proper cache policies for static assets vs HTML
4. ✅ Add CloudFront Function for directory rewrite (optional)

### Step 4: Verify Deployment

1. Check if JavaScript files are accessible:
```powershell
curl -I https://dev.arjunasarrow.in/_next/static/chunks/framework-f0f34dd321686665.js
# Should return: Content-Type: application/javascript
```

2. Check if pages load correctly:
```powershell
curl -I https://dev.arjunasarrow.in/dashboard/
curl -I https://dev.arjunasarrow.in/contact/
```

3. Test in browser:
   - Open browser console (F12)
   - Navigate to https://dev.arjunasarrow.in
   - Check for no MIME type errors
   - Test all policy pages

## Common Issues and Solutions

### Issue: Files still returning HTML
**Solution:** Verify the files exist in S3:
```bash
aws s3 ls s3://dev.arjunasarrow.in/_next/static/chunks/ --recursive
```

### Issue: MIME type still wrong
**Solution:** Re-upload with explicit content-type:
```bash
aws s3 sync out/_next/ s3://dev.arjunasarrow.in/_next/ \
  --content-type "application/javascript" \
  --exclude "*" \
  --include "*.js" \
  --metadata-directive REPLACE
```

### Issue: Changes not visible
**Solution:** Clear CloudFront cache:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*" "/_next/*"
```

## Files Updated
- ✅ `next.config.js` - Simplified configuration
- ✅ `public/.nojekyll` - Prevent Jekyll processing
- ✅ `deploy-to-s3.ps1` - Deployment script
- ✅ `CLOUDFRONT_SETUP.md` - CloudFront configuration guide
- ✅ All policy pages created and working

## Policy Pages URLs
All policy pages are now available at:
- `/contact/`
- `/privacy-policy/`
- `/cancellation-refund/`
- `/shipping-delivery/`
- `/terms-conditions/`

## Next Steps for DevOps Team
1. Review and apply CloudFront configuration from `CLOUDFRONT_SETUP.md`
2. Use `deploy-to-s3.ps1` for future deployments
3. Ensure CI/CD pipeline includes proper content-type headers
4. Test deployment on staging before production

## Support
If issues persist after following these steps, check:
- CloudFront distribution settings
- S3 bucket permissions
- CloudFront cache behavior priority
- Origin settings (should point to S3 bucket, not website endpoint)

# PDF Viewer System Documentation

## Overview
Dual PDF rendering system with device-specific optimization and comprehensive piracy protection for secure content delivery.

## Architecture

### Components
1. **PDFViewer** (`src/components/content/PDFViewer.tsx`) - Desktop/PC viewer
2. **MobilePDFViewer** (`src/components/content/MobilePDFViewer.tsx`) - Mobile/tablet viewer
3. **ContentPlayer** (`src/components/content/ContentPlayer.tsx`) - Orchestrator component

### Technology Stack
- **@react-pdf-viewer/core** - Core PDF rendering engine
- **@react-pdf-viewer/default-layout** - Desktop toolbar (PC)
- **@react-pdf-viewer/page-navigation** - Mobile navigation controls
- **@react-pdf-viewer/zoom** - Mobile zoom functionality
- **PDF.js v3.11.174** - Worker for PDF parsing

---

## Content Delivery Flow

### 1. Content Loading
```
User Request → ContentPlayer → Device Detection → Appropriate Viewer Component
```

### 2. URL Construction
- Content URL format: `/api/content/serve-pdf?id={id}&chapterId={chapterId}`
- Backend serves PDF through secure API endpoint (obfuscates actual storage location)
- No direct S3/CloudFront URLs exposed to client

### 3. Device Detection
**useIsMobile Hook** detects:
- Screen width breakpoints (mobile: ≤768px, tablet: 768-1024px, desktop: >1024px)
- User agent (Android, iOS, iPad, etc.)
- iOS-specific detection (including iPad Pro)
- Orientation changes

### 4. Component Selection
```typescript
const PDFComponent = isMobile || isTablet ? MobilePDFViewer : PDFViewer
```

---

## Features

### Desktop (PDFViewer)
**Toolbar Controls:**
- Previous/Next page navigation
- Current page input with total pages counter
- Zoom in/out controls
- Full-screen mode (except iOS)
- Minimal sidebar (removed for cleaner UI)

**Display:**
- `SpecialZoomLevel.ActualSize` - Shows PDF at actual size
- Full-height viewer (70vh)

### Mobile (MobilePDFViewer)
**Navigation Controls:**
- Sticky bottom toolbar
- Large touch-friendly navigation buttons
- Page indicator with input field
- Separate zoom control row

**Display:**
- `SpecialZoomLevel.PageWidth` - Optimized for mobile screens
- Taller viewport (85vh)

**iOS-Specific Features:**
- Custom fullscreen implementation (native fullscreen API limited on iOS)
- Portal-based modal overlay
- Safe area inset support (notch/home indicator)
- Landscape orientation lock attempt
- Body/HTML scroll prevention
- Dedicated exit button in fullscreen header

**Standard Fullscreen (Android/Desktop):**
- Native Fullscreen API
- Automatic fullscreen state tracking

---

## Piracy Protection Mechanisms

### 1. Right-Click Prevention
```javascript
document.addEventListener('contextmenu', (e) => e.preventDefault())
```
- Blocks context menu on all PDF content
- Prevents "Save As" or "Print" options

### 2. Keyboard Shortcut Blocking
```javascript
// Disables Ctrl+P (print) and Ctrl+S (save)
if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
  e.preventDefault()
}
```
- Intercepts print/save keyboard shortcuts
- Works on both Windows (Ctrl) and Mac (Cmd)

### 3. Print Function Override
```javascript
window.print = () => {} // No-op function
```
- Completely disables `window.print()` function
- Prevents programmatic printing attempts

### 4. Text Selection Disabled
```css
userSelect: 'none'
WebkitUserSelect: 'none'
MozUserSelect: 'none'
msUserSelect: 'none'
```
- CSS prevents text highlighting and copying
- Applied at viewer container and page layer levels

### 5. URL Obfuscation
- Backend API endpoint serves PDFs instead of direct file URLs
- Actual storage location (S3/CloudFront) hidden from client
- API enforces authentication and authorization

### 6. Security Headers (from API)
```javascript
headers: {
  'X-Requested-With': 'XMLHttpRequest',
  'X-Client-Origin': currentDomain,
  'X-Client-Referer': document.referrer || currentDomain
}
```
- Validates legitimate client requests
- Prevents direct URL access from external sources

### 7. Dynamic Loading
- PDFs lazy-loaded via Next.js dynamic imports
- Reduces bundle size and delays viewer initialization
- Worker loaded from CDN only when needed

---

## State Management

### Loading States
1. **Initial Load** - CircularProgress with "Loading PDF document..."
2. **Document Ready** - Triggers `onContentReady()` callback
3. **Error State** - Alert component with error message

### Fullscreen States (Mobile)
- `isFullScreen` - Native fullscreen API state (Android/desktop)
- `isCustomFullscreen` - Custom modal state (iOS)
- Cleanup of body styles on unmount

---

## CSS Styling & Responsive Design

### Desktop
```css
height: 70vh
backgroundColor: #f5f5f5
overflow: hidden
```

### Mobile
```css
height: 85vh (more screen real estate)
Sticky bottom toolbar
Touch-optimized button sizes
```

### Fullscreen (iOS Custom)
```css
position: fixed
z-index: 9999
100vw × 100dvh (dynamic viewport height)
Safe area insets (env(safe-area-inset-*))
```

---

## Error Handling

### Scenarios Covered
1. Invalid content URL (missing id/chapterId)
2. API fetch failures
3. PDF loading errors
4. Unsupported content types

### User Feedback
- Error messages via Material-UI Alert component
- Specific error descriptions passed to parent via `onError` prop

---

## Performance Optimizations

1. **Lazy Loading** - Components loaded only when PDF content is requested
2. **Worker CDN** - PDF.js worker loaded from unpkg CDN
3. **Minimal Plugins** - Desktop uses default-layout, mobile uses modular plugins
4. **Single Worker Instance** - Worker URL reused across renders
5. **Dynamic Viewport Heights** - Optimized screen usage per device

---

## Watermarking Strategy (Anti-Piracy)

To prevent unauthorized distribution via screenshots or photos, we implement a robust watermarking system using a custom `WatermarkPageLayer` component.

### Implementation Details
Instead of using a simple overlay (which can be easily removed or might not scroll with the page), we inject the watermark directly into the PDF rendering pipeline using the `renderPage` API.

**Component: `WatermarkPageLayer`**
- **Lifecycle Hook**: Uses `useEffect` to call `markRendered` when the canvas and text layers are ready. This ensures the viewer knows the page is complete.
- **Layer Stacking**: Renders the watermark *after* the text layer, ensuring it sits on top of the content visually.
- **Positioning**: Uses absolute positioning within the page container, so the watermark scales and moves perfectly with the document (zooming, scrolling).
- **Visibility**: Uses `mix-blend-mode: multiply` to ensure the watermark is visible even on white backgrounds, and `pointer-events: none` to allow text selection underneath.

### Watermark Layout
1.  **Top-Left**: User's full name (e.g., "John Doe").
2.  **Bottom-Right**: User's email (e.g., "john@example.com").
3.  **Center**: Large, diagonal, faint repetition of the email address.

This ensures that any partial screenshot will likely contain at least one identifier.

---

## Security Summary

| Protection Type | Implementation | Effectiveness |
|----------------|----------------|---------------|
| Right-Click Block | Event listener | High |
| Keyboard Shortcuts | Keydown prevention | High |
| Text Selection | CSS user-select | High |
| Print Override | window.print = noop | High |
| URL Obfuscation | Backend API | Very High |
| Security Headers | Referer validation | Medium-High |

**Limitations:**
- Browser extensions (e.g., print-to-PDF) may bypass some protections
- Screen capture tools cannot be blocked at browser level
- Developer tools access could reveal worker URLs

**Best Practice:**
- Combine frontend protections with backend access control
- Use signed URLs with short expiration on backend
- Implement rate limiting and abuse detection
- Watermark PDFs with user identification at generation time

# PDF Rendering Core Concepts & Watermarking Strategy

## Core Architecture of `@react-pdf-viewer/core`

The React PDF Viewer library is built on top of PDF.js. It uses a layered approach to render each page:

1.  **Canvas Layer**: Renders the actual PDF content (text, images, vectors) as a bitmap on an HTML `<canvas>` element. This is what you "see".
2.  **Text Layer**: An invisible layer of HTML `<span>` elements positioned exactly over the text in the canvas. This allows users to select and copy text.
3.  **Annotation Layer**: Renders interactive elements like links and form fields.

### The `renderPage` Lifecycle

When the viewer renders a page, it executes the following steps:
1.  Calculates the viewport and scale.
2.  Creates the container for the page.
3.  Calls the `renderPage` function (if provided) or uses the default renderer.
4.  The renderer is responsible for placing the Canvas, Text, and Annotation layers.
5.  **Crucial Step**: The renderer must signal when rendering is complete by calling `markRendered`.

## Why the Previous Approach Failed

### 1. External Overlays vs. Page Content
Initially, we tried placing a `<div>` with `z-index: 9999` *outside* or *on top* of the Viewer component.
*   **Issue**: This creates a static overlay over the viewport. When the user scrolls, the watermark stays in place relative to the screen, not the document. It doesn't look like it's "part of the paper".
*   **Mobile Issue**: On mobile, especially with pinch-to-zoom, an external overlay might not scale or move correctly with the PDF content.

### 2. `renderPage` Implementation Gaps
We moved to using `renderPage` to inject the watermark *into* the page container.
*   **Issue**: The initial implementation missed the `markRendered` call.
*   **Consequence**: The viewer tracks the rendering state of each page. If `markRendered` is not called, the viewer might consider the page "incomplete" or "loading". This can prevent the page from displaying correctly, or cause the viewer to unmount/remount the page repeatedly, leading to invisible content or watermarks.

## The Effective Solution: `WatermarkPageLayer`

We implemented a custom `WatermarkPageLayer` component that correctly hooks into the rendering lifecycle.

### Key Features:
1.  **Lifecycle Management**:
    ```typescript
    useEffect(() => {
      if (renderPageProps.canvasLayerRendered && renderPageProps.textLayerRendered) {
        renderPageProps.markRendered(renderPageProps.pageIndex);
      }
    }, [...]);
    ```
    This ensures the viewer knows exactly when the page is ready.

2.  **Layer Stacking**:
    ```tsx
    <>
      {renderPageProps.canvasLayer.children}      {/* Bottom: PDF Image */}
      {renderPageProps.annotationLayer.children}  {/* Middle: Links */}
      {renderPageProps.textLayer.children}        {/* Top: Selectable Text */}
      <WatermarkOverlay>...</WatermarkOverlay>    {/* Top-most: Watermark */}
    </>
    ```
    By placing the watermark last in the fragment, it is rendered *after* the other layers, ensuring it sits on top (visually) while `pointer-events: none` allows clicks to pass through to the text/annotation layers.

3.  **Scoped Styling**:
    The watermark is positioned `absolute` with `top: 0; left: 0; width: 100%; height: 100%`. Because it is rendered *inside* the page container (which has `position: relative`), it perfectly covers the individual page, scaling and moving with it.

## Security & Piracy Prevention

This approach provides robust protection:
*   **Screenshot Prevention**: The watermark is part of the page DOM. Any screenshot (OS-level or browser) will capture the watermark.
*   **Printing**: Since we override `window.print` and disable Ctrl+P, printing is blocked. Even if forced, the watermark is part of the page content.
*   **DOM Inspection**: While a savvy user *could* delete the watermark node from the DOM, this requires technical knowledge. For the average user, it is persistent.

## Next Steps for Verification
1.  **Clear Cache**: Ensure the browser is not serving a cached version of the worker or viewer.
2.  **Check Console**: Look for "User data" logs (which we removed, but you can add back if needed) to ensure `user` object is present.
3.  **Inspect Element**: Use DevTools to inspect a page. You should see the `rpv-core__page-layer` containing the canvas, text layer, and your `WatermarkOverlay` div.

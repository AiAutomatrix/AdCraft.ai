# Debugging Guide: OG Image Generation Failure

## Problem Summary
The OG Image generation endpoint (`/api/og`) is returning a valid PNG image, but the dynamic background image (the Ad creative) is missing. The text renders correctly on a black background.

**Suspected Cause:** The endpoint is likely using `@vercel/og` (Satori), which has known limitations with specific image formats (WebP) and strict CSS layout rules.

---

## 1. The "WebP" Compatibility Issue (Most Likely)

The test script uses a Firebase Storage URL ending in `.webp`:
`.../2499d0e2-a006-4449-9f79-c793db5f866a.webp`

**The Issue:**
Many Open Graph generation libraries (specifically Satori/`@vercel/og` running on Edge or Node) often **fail silently** when trying to render WebP images because they lack the necessary decoding logic in the lightweight environment. They require PNG or JPEG.

### Solution A: Quick Test
Change the `TEST_AD_IMAGE_URL` in your bash script to a standard **JPG** or **PNG** URL (e.g., a placeholder image from Unsplash or a specific PNG from your storage bucket) and run the script again.
*   If the image appears, the code is fine, but the format (WebP) is the problem.

### Solution B: Fix Implementation
If WebP is the culprit, you have two options in your `api/og` code:

1.  **Fetch and Convert (Hard):** Fetch the WebP buffer and convert it to ArrayBuffer/PNG using a library like `sharp` (if running in Node) before passing it to the Image Response.
2.  **Use a Proxy/Resize Service (Easy):** If you are using Firebase Extensions (Resize Images), link to the converted JPEG version instead of the original WebP.

---

## 2. The URL Token Truncation Issue

Firebase Storage URLs contain query parameters: `?alt=media&token=xyz...`.

**The Issue:**
If the API endpoint handles the query parameters loosely, the `&token=` part of the Firebase URL might be interpreted as a *new* parameter for the API itself, rather than part of the `imageUrl`.

**Debugging Step:**
In your `/api/og` route handler, add a log to see exactly what string the code receives.

```typescript
// Inside your API Route
const { searchParams } = new URL(request.url);
const imageUrl = searchParams.get('imageUrl');

console.log("RECEIVED IMAGE URL:", imageUrl); 
// Check: Does this log end with "...abc-123"? Or is the token missing?
// If the token is missing, the image request returns 403 Forbidden (which renders as transparent/black).
```

---

## 3. The "Satori" CSS Layout Issue

If you are using `@vercel/og`, the CSS engine (Satori) is not a full browser engine. It is strict about Flexbox.

**The Issue:**
*   `<img>` tags often fail to render if they don't have an explicit `display: flex`, `width`, and `height` (or `width: '100%', height: '100%'`) set in the `style={{}}` prop.
*   `object-fit: cover` implementation is sometimes buggy without absolute positioning.

### Solution: Rigid Layout
Update the JSX in your ImageResponse to be extremely explicit:

```tsx
<div
  style={{
    display: 'flex',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: 'black',
    position: 'relative', // Context for absolute image
  }}
>
  {/* Move image to absolute background */}
  <img
    src={imageUrl}
    width="1200" // Explicit attributes often help Satori
    height="630"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: 0, // Ensure it is behind text
    }}
  />
  
  {/* Content Layer */}
  <div style={{ zIndex: 1, color: 'white', display: 'flex' }}>
     {/* Your Title Text */}
  </div>
</div>
```

---

## 4. Diagnostic Questions for the IDE Agent

If the solutions above do not work, ask the IDE Agent these specific questions to get the code snippets needed to solve it:

1.  **"Please show me the code for the `/api/og` route handler."** (We need to see if it's using `@vercel/og`, `canvas`, or `puppeteer`).
2.  **"Are there any console logs on the server when I run the test script?"** (Look for 403s or decoding errors).
3.  **"Does the environment running this API support `fetch` to external domains?"** (Sometimes local firewalls block the server from fetching the Firebase image).


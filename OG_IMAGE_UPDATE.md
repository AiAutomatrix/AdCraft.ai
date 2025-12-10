
# Plan: Dynamic Open Graph Image Generation

This document outlines the implementation plan for creating dynamic, shareable preview images (Open Graph images) for public ad pages. This approach is designed to be robust, isolated, and avoid the server-side rendering issues encountered previously.

## 1. Core Concept

The goal is to generate a custom image for each ad when its public link is shared on social media. This provides a rich preview card instead of just a plain text link.

We will achieve this by:
1.  Keeping the main public profile page (`/profile/[userId]`) as a **client-side rendered page**. This ensures it remains fast and does not require server-side Firebase Admin authentication, which was the source of our previous problems.
2.  Creating a new, dedicated **Next.js API Route (an Image Response)**. This route's sole job is to fetch ad data and generate an image on-demand.
3.  Adding a dynamic `<meta property="og:image" ...>` tag to the public profile page's head, which points to our new image-generating API route.

## 2. Technical Implementation Steps

### Step 1: Install Required Library

We will use `@vercel/og`, a powerful library designed specifically for generating dynamic images from HTML and CSS within Next.js.

We will need to add this to our `package.json`:
```json
"dependencies": {
  // ... other packages
  "@vercel/og": "^0.6.2"
}
```

### Step 2: Create the Image Generation API Route

We will create a new file at `src/app/api/og/[adId]/route.ts`.

This file will:
- Be a **Route Handler** that uses the `ImageResponse` class from `@vercel/og`.
- Safely initialize the **Firebase Admin SDK** to fetch data on the server.
- Extract the `adId` from the request URL.
- Fetch the specific ad's data (title, primary image URL) from Firestore.
- Use JSX (like React components) to define the layout of our Open Graph image. This will include the ad's main photo as a background and the ad's title overlaid on top.
- Return the generated image as a `Response`.

**Example Code Structure for `src/app/api/og/[adId]/route.ts`:**

```tsx
// src/app/api/og/[adId]/route.ts
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getAdData } from '@/lib/server-actions'; // We'll need a server-side fetcher

export const runtime = 'edge'; // Vercel OG works best on the Edge runtime

export async function GET(req: NextRequest, { params }: { params: { adId: string } }) {
  const adId = params.adId;
  const ad = await getAdData(adId); // Fetch ad data using Firebase Admin

  if (!ad) {
    return new Response('Ad not found', { status: 404 });
  }

  // Define the image layout using HTML/CSS styles
  return new ImageResponse(
    (
      <div style={{ display: 'flex', ... }}>
        <img src={ad.images?.[0]} style={{ ... }} />
        <h1 style={{ ... }}>{ad.title}</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### Step 3: Update the Public Profile Page (`/profile/[userId]/page.tsx`)

We need to add the `og:image` meta tag to this page. Since the page data is loaded on the client, we will need to dynamically update the `<head>` after we have the ad data.

- When a user clicks an ad to open the modal, we have the `selectedAd` data.
- We will create a small, client-side component or hook that takes this `selectedAd` data and dynamically injects the appropriate meta tags into the document's `<head>`.

**Example of dynamic meta tag insertion:**

```tsx
// In a component that runs on the client within the profile page
useEffect(() => {
  if (selectedAd) {
    // Set og:image
    let imageMeta = document.querySelector('meta[property="og:image"]');
    if (!imageMeta) {
      imageMeta = document.createElement('meta');
      imageMeta.setAttribute('property', 'og:image');
      document.head.appendChild(imageMeta);
    }
    const imageUrl = `${window.location.origin}/api/og/${selectedAd.id}`;
    imageMeta.setAttribute('content', imageUrl);

    // Also set og:title, og:description, etc.
    // ...
  }
}, [selectedAd]);
```
*Note: A more robust solution might use a library like `next-seo` or Next.js 14's built-in `generateMetadata` if we can structure it correctly, but direct DOM manipulation is a straightforward way to start.*

## 3. Why This Approach is Better

- **Isolation:** The server-side logic is completely separate from the UI. A failure in the image generator will result in a broken preview image, but it **will not crash the entire user profile page.**
- **No Client-Side Firebase Admin:** The main app continues to use the safe, client-side Firebase SDK. The sensitive admin key is only used in the isolated server environment of the API route.
- **Performance:** The user profile page loads quickly as a client component. The image generation only happens when a crawler (or someone directly accessing the API URL) requests it.

This plan provides a clear and safe path to implementing the desired feature without repeating past mistakes.

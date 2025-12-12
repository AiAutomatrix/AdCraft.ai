
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// A high-quality, generic fallback image that will be used if the ad's image is missing.
const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&h=630&auto=format&fit=crop';

// The runtime MUST be 'edge' for @vercel/og to work correctly.
export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: { adId: string } }) {
  const { adId } = params;

  // The 'imageUrl' and 'title' are passed as search parameters.
  const imageUrl = req.nextUrl.searchParams.get('imageUrl');
  const title = req.nextUrl.searchParams.get('title') || 'AdCraft AI Ad';

  try {
    // CRITICAL FIX: Decode the image URL to handle special characters.
    // If the imageUrl is present, decode it; otherwise, use the reliable fallback.
    const finalImage = imageUrl ? decodeURIComponent(imageUrl) : FALLBACK_IMAGE_URL;
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            position: 'relative',
            color: 'white',
            textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
            backgroundColor: 'black',
            fontFamily: '"Inter"',
          }}
        >
          {/* The img tag uses the finalImage URL. It's positioned to cover the background. */}
          <img
            alt=""
            src={finalImage}
            width="1200"
            height="630"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* A gradient overlay to make the text more readable. */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '60%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
            }}
          />
          <div style={{ padding: '60px', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: 60, fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: '"Space Grotesk"' }}>
              {title}
            </h1>
            <p style={{ fontSize: 28, marginTop: 16, opacity: 0.8 }}>View on AdCraft AI</p>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error(`[OG Image] Critical error generating image for adId ${adId}:`, error);
    // Return a generic fallback image on any critical failure.
    return new ImageResponse(
        (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', backgroundColor: '#0C0F1A', color: 'white', fontFamily: '"Inter"' }}>
                <h1 style={{ fontSize: 60, fontWeight: 700, margin: 0, fontFamily: '"Space Grotesk"' }}>AdCraft AI</h1>
                <p style={{ fontSize: 28, marginTop: 16, opacity: 0.7 }}>Error Generating Image</p>
            </div>
        ),
        { width: 1200, height: 630 }
    );
  }
}

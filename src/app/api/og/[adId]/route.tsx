
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getAdData } from '@/lib/server-actions';
import { Ad } from '@/lib/types';

const LOCAL_FALLBACK_URL = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8MA%3D%3D';

// Ensure this route runs on the Node.js runtime, not the Edge, to use firebase-admin.
export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: { adId: string } }) {
  const { adId } = params;
  console.log(`[OG Image] Received request for adId: ${adId}`);

  try {
    const ad: Ad | null = await getAdData(adId);

    if (!ad) {
        console.warn(`[OG Image] Ad not found for adId: ${adId}. Using fallback.`);
        // Return a generic fallback image if the ad doesn't exist
        return new ImageResponse(
            (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', backgroundColor: '#0C0F1A', color: 'white', fontFamily: 'Inter' }}>
                    <h1 style={{ fontSize: 60, fontWeight: 700, margin: 0 }}>AdCraft AI</h1>
                    <p style={{ fontSize: 28, marginTop: 16, opacity: 0.7 }}>Ad not found</p>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    }
    
    const title = ad.title || 'AdCraft AI Ad';
    const finalImage = ad.images?.[0] || LOCAL_FALLBACK_URL;

    console.log(`[OG Image] Found ad title: "${title}"`);
    console.log(`[OG Image] Using final image URL: ${finalImage}`);

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
            fontFamily: 'Inter',
          }}
        >
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
          <div style={{ padding: '60px', zIndex: 10 }}>
            <h1 style={{ fontSize: 60, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
              {title}
            </h1>
            <p style={{ fontSize: 28, marginTop: 16, opacity: 0.7 }}>View on AdCraft AI</p>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error(`[OG Image] Critical error generating image for adId ${adId}:`, error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

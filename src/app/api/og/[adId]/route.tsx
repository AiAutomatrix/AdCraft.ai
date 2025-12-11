
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getAdData } from '@/lib/server-actions';

export const runtime = 'edge';

const LOCAL_FALLBACK_URL = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8MA%3D%3D';


// Helper: Wrap remote images through a proxy so Next OG can load them
function proxiedImage(origin: string, url: string) {
  return `${origin}/api/og-image-proxy?url=${encodeURIComponent(url)}`;
}

export async function GET(req: NextRequest, { params }: { params: { adId: string } }) {
  const origin = req.nextUrl.origin;
  const { adId } = params;
  console.log(`[OG Image] Received request for adId: ${adId}`);

  try {
    const ad = await getAdData(adId);
    console.log('[OG Image] Fetched ad data:', ad ? { title: ad.title, images: ad.images } : 'Not Found');

    // No ad found → simple fallback OG image
    if (!ad) {
      console.log('[OG Image] Ad not found. Generating fallback image.');
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              backgroundColor: 'black',
              color: 'white',
              fontSize: 48,
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <img
              src={proxiedImage(origin, LOCAL_FALLBACK_URL)}
              alt=""
              width="1200"
              height="630"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.25,
              }}
            />
            <div style={{ zIndex: 10 }}>
              <p>AdCraft AI</p>
              <p style={{ fontSize: 26, marginTop: 10 }}>Ad not found</p>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // Resolve the ad image or fallback
    let finalImage = LOCAL_FALLBACK_URL;

    if (ad.images?.[0]) {
      finalImage = ad.images[0];
    }
    
    const proxiedFinalImage = proxiedImage(origin, finalImage);
    console.log(`[OG Image] Using title: "${ad.title}"`);
    console.log(`[OG Image] Using final proxied image URL: ${proxiedFinalImage}`);


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
          {/* Background image */}
          <img
            alt=""
            src={proxiedFinalImage}
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

          {/* Dark gradient overlay */}
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

          {/* Text */}
          <div style={{ padding: '60px', zIndex: 10 }}>
            <h1 style={{ fontSize: 60, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
              {ad.title}
            </h1>
            <p style={{ fontSize: 28, marginTop: 16, opacity: 0.7 }}>View on AdCraft AI</p>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error('[OG Image] Critical error generating image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

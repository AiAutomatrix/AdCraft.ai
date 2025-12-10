
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getAdData } from '@/lib/server-actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// We can use a custom font if we'd like.
// const interRegular = fetch(
//   new URL('../../../../assets/Inter-Regular.ttf', import.meta.url)
// ).then((res) => res.arrayBuffer());

// The main GET handler for our OG image API route.
export async function GET(req: NextRequest, { params }: { params: { adId: string } }) {
  const adId = params.adId;

  try {
    // Fetch the ad data using our server-side action.
    const ad = await getAdData(adId);

    // If no ad is found, return a generic fallback image.
    // This prevents the image generator from crashing.
    if (!ad) {
      const fallbackImage = PlaceHolderImages.find(p => p.id === 'hero-car-sell');
      return new ImageResponse(
        (
          <div style={{
            fontSize: 42,
            background: 'hsl(225 21% 6%)', // background color
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            {fallbackImage && <img src={fallbackImage.imageUrl} width="1200" height="630" alt="" style={{ position: 'absolute', opacity: 0.3 }} />}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: '1rem',
            }}>
              <p>AdCraft AI</p>
              <p style={{ fontSize: 24, marginTop: 8, color: 'hsl(222 28% 57%)' }}>Ad not found.</p>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }
    
    // Use the first image of the ad, or a fallback if none exist.
    const imageUrl = ad.images?.[0] || PlaceHolderImages.find(p => p.id === 'hero-car-sell')?.imageUrl || '';

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
            fontFamily: '"Inter"',
            color: 'white',
            textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
            backgroundColor: 'hsl(225 21% 6%)'
          }}
        >
          {/* Background Image */}
          <img
            alt=""
            width="1200"
            height="630"
            src={imageUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '60%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
            }}
          />
          {/* Text Content */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '60px' }}>
            <h1 style={{ fontSize: '60px', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
              {ad.title}
            </h1>
            <p style={{ fontSize: '28px', color: 'rgba(255,255,255,0.7)', marginTop: '16px' }}>
              View on AdCraft AI
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error(`[OG Image] Failed to generate image for ad ${adId}:`, error);
    // Return a generic error response if something goes wrong during generation.
    return new Response(`Failed to generate image: ${(error as Error).message}`, { status: 500 });
  }
}

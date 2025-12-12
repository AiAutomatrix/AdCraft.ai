
import { Ad } from '@/lib/types';
import type { Metadata, ResolvingMetadata } from 'next';
import ProfilePageClient from '@/components/profile/profile-page-client';
import { firestore } from '@/lib/firebase-admin';

type Props = {
  params: { userId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// This server-side function can safely use firebase-admin
async function getAdData(adId: string): Promise<Ad | null> {
    try {
      const usersSnapshot = await firestore.collection('users').get();
      
      let adDoc;
      for (const userDoc of usersSnapshot.docs) {
        const potentialAdRef = firestore.collection('users').doc(userDoc.id).collection('ads').doc(adId);
        const potentialAdSnap = await potentialAdRef.get();
        if (potentialAdSnap.exists) {
          adDoc = potentialAdSnap;
          break;
        }
      }
  
      if (!adDoc) {
        console.warn(`[getAdData] Ad with ID "${adId}" not found in any user's collection.`);
        return null;
      }
  
      const adData = adDoc.data();
      if (!adData) return null;
  
      const convertedData = {
          ...adData,
          createdAt: adData.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
          updatedAt: adData.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
      };
      
      return { id: adDoc.id, ...convertedData } as Ad;
  
    } catch (error) {
      console.error(`[getAdData] Failed to fetch ad "${adId}":`, error);
      // Don't throw here, just return null to allow for fallback metadata.
      return null;
    }
}


export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const userId = params.userId;
  const adId = searchParams.ad as string | undefined;

  const userDoc = await firestore.collection('users').doc(userId).get();
  const user = userDoc.data();
  const defaultTitle = user?.displayName ? `${user.displayName}'s Ads on AdCraft AI` : 'AdCraft AI User Profile';
  const defaultDescription = `Browse ads created by ${user?.displayName || 'an AdCraft AI user'}.`;
  
  const defaultOgImage = 'https://adcraft-ai-cogmora.vercel.app/og-image-default.png';

  // If no specific ad is being shared, return default metadata for the profile page.
  if (!adId) {
    return {
      title: defaultTitle,
      description: defaultDescription,
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        images: [{ url: defaultOgImage, width: 1200, height: 630 }],
      },
    };
  }

  const ad = await getAdData(adId);

  // If the ad can't be found, return generic "not found" metadata.
  if (!ad) {
    return {
      title: 'Ad Not Found - AdCraft AI',
      description: 'The requested ad could not be found or may have been deleted.',
      openGraph: {
        images: [{ url: defaultOgImage, width: 1200, height: 630 }],
      }
    };
  }

  // Construct the OG image URL with the ad title and image URL as query parameters.
  // This is the most reliable way to pass data to the Edge runtime OG generator.
  const ogImageUrl = `/api/og/${ad.id}?title=${encodeURIComponent(ad.title)}&imageUrl=${encodeURIComponent(ad.images?.[0] || '')}`;

  return {
    title: ad.title,
    description: ad.content.substring(0, 150) + '...',
    openGraph: {
      title: ad.title,
      description: ad.content.substring(0, 150) + '...',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ad.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ad.title,
      description: ad.content.substring(0, 150) + '...',
      images: [ogImageUrl],
    },
  };
}

async function getInitialData(userId: string): Promise<{ userProfile: any | null, ads: Ad[] }> {
    try {
        const userDocRef = firestore.collection('users').doc(userId);
        const adsCollectionRef = userDocRef.collection('ads').orderBy('createdAt', 'desc');

        const [userDoc, adsSnapshot] = await Promise.all([
            userDocRef.get(),
            adsCollectionRef.get()
        ]);

        let userProfile = null;
        if (userDoc.exists) {
            const data = userDoc.data();
            userProfile = {
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
            };
        }

        const ads = adsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
            } as Ad;
        });

        return { userProfile, ads };
    } catch (error) {
        console.error("Error fetching initial profile data:", error);
        return { userProfile: null, ads: [] };
    }
}


export default async function UserProfilePage({ params }: Props) {
  const { userId } = params;
  const { userProfile, ads } = await getInitialData(userId);

  return <ProfilePageClient initialUserProfile={userProfile} initialAds={ads} />;
}

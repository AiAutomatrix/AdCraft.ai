
import { Ad } from '@/lib/types';
import type { Metadata, ResolvingMetadata } from 'next';
import ProfilePageClient from '@/components/profile/profile-page-client';
import { firestore } from '@/lib/firebase-admin';

type Props = {
  params: { userId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// This function now works correctly because this file is a Server Component.
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const userId = params.userId;
  const adId = searchParams.ad as string | undefined;

  // If no ad ID is in the URL, use default metadata for the user's profile
  if (!adId) {
    const userDoc = await firestore.collection('users').doc(userId).get();
    const user = userDoc.data();
    const title = user?.displayName ? `${user.displayName}'s Ads on AdCraft AI` : 'AdCraft AI User Profile';
    return {
      title,
      description: "Browse ads created by AdCraft AI users.",
    };
  }

  // If there is an ad ID, fetch that specific ad's data
  let ad: Ad | null = null;
  try {
      const adDocRef = firestore.collection('users').doc(userId).collection('ads').doc(adId);
      const adDoc = await adDocRef.get();
      if (adDoc.exists) {
          const adData = adDoc.data();
          // Ensure timestamps are serializable if they exist
          const convertedData = {
              ...adData,
              createdAt: adData.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
              updatedAt: adData.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
          };
          ad = { id: adDoc.id, ...convertedData } as Ad;
      }
  } catch (e) {
      console.error(`[generateMetadata] Failed to fetch ad data for OG: ${adId}`, e);
  }


  // If ad isn't found, return a clear "not found" metadata
  if (!ad) {
    return {
      title: 'Ad Not Found - AdCraft AI',
      description: 'The requested ad could not be found or may have been deleted.',
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
        const adsCollectionRef = userDocRef.collection('ads');

        const [userDoc, adsSnapshot] = await Promise.all([
            userDocRef.get(),
            adsCollectionRef.orderBy('createdAt', 'desc').get()
        ]);

        let userProfile = null;
        if (userDoc.exists) {
            const data = userDoc.data();
            // Serialize timestamps for the userProfile object
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

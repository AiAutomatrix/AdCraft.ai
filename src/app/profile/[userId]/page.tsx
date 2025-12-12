
import { Ad } from '@/lib/types';
import type { Metadata, ResolvingMetadata } from 'next';
import ProfilePageClient from '@/components/profile/profile-page-client';
import { firestore } from '@/lib/firebase-admin';

type Props = {
  params: { userId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const userId = params.userId;
  const adId = searchParams.ad as string | undefined;

  const userDoc = await firestore.collection('users').doc(userId).get();
  const user = userDoc.data();
  const title = user?.displayName ? `${user.displayName}'s Ads on AdCraft AI` : 'AdCraft AI User Profile';

  if (!adId) {
    return {
      title,
      description: "Browse ads created by AdCraft AI users.",
    };
  }

  let ad: Ad | null = null;
  try {
      const adDocRef = firestore.collection('users').doc(userId).collection('ads').doc(adId);
      const adDoc = await adDocRef.get();
      if (adDoc.exists) {
          const adData = adDoc.data();
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

  if (!ad) {
    return {
      title: 'Ad Not Found - AdCraft AI',
      description: 'The requested ad could not be found or may have been deleted.',
    };
  }

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

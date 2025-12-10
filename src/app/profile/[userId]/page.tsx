
import { Ad } from '@/lib/types';
import { getAdData } from '@/lib/server-actions';
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

  // If no ad ID is in the URL, use default metadata
  if (!adId) {
    const userDoc = await firestore.collection('users').doc(userId).get();
    const user = userDoc.data();
    const title = user?.displayName ? `${user.displayName}'s Ads` : 'AdCraft AI User Profile';
    return {
      title,
      description: "Browse ads created by AdCraft AI users.",
    };
  }

  // Fetch the specific ad data on the server
  const ad = await getAdData(adId);

  // If ad isn't found, return default metadata
  if (!ad) {
    return {
      title: 'Ad Not Found - AdCraft AI',
      description: 'The requested ad could not be found.',
    };
  }

  // Get the previous Open Graph images
  const previousImages = (await parent).openGraph?.images || [];
  
  const ogImageUrl = `/api/og/${ad.id}`;

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
        ...previousImages,
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

        const userProfile = userDoc.exists ? userDoc.data() : null;

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

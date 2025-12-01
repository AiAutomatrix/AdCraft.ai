'use client';

import { Ad } from '@/lib/types';
import { useMemoFirebase, useFirestore } from '@/firebase';
import { collection, getDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Car,
  Loader2,
  Search,
  Briefcase,
  Package,
  ChevronsUpDown,
  Share2,
  Volume2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notFound, useParams } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase/firestore/use-collection';
import ReactMarkdown from 'react-markdown';
import { textToSpeechAction } from '@/lib/actions';

function formatDate(timestamp: any): string {
  if (!timestamp) return 'N/A';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }
  if (typeof timestamp === 'string') {
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  }
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString();
  }
  return 'Invalid Date';
}

type UserProfile = {
  displayName: string;
  email: string;
  photoURL: string;
};

const AdCard = ({ ad }: { ad: Ad }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const { toast } = useToast();

  const getBadgeVariant = (type: Ad['type']) => {
    switch (type) {
      case 'sale':
      case 'item':
        return 'default';
      case 'wanted':
      case 'service':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPlaceholderIcon = (type: Ad['type']) => {
    switch (type) {
      case 'sale':
        return <Car className="w-16 h-16 text-text-secondary opacity-50" />;
      case 'wanted':
        return <Search className="w-16 h-16 text-text-secondary opacity-50" />;
      case 'item':
        return <Package className="w-16 h-16 text-text-secondary opacity-50" />;
      case 'service':
        return (
          <Briefcase className="w-16 h-16 text-text-secondary opacity-50" />
        );
      default:
        return null;
    }
  };

  const handleShareAd = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: ad.content,
        });
        toast({
          title: 'Ad Shared!',
          description: 'The ad details have been shared.',
        });
      } catch (error) {
        console.log('Share was cancelled or failed', error);
      }
    } else {
      navigator.clipboard.writeText(`${ad.title}\n\n${ad.content}`);
      toast({
        title: 'Content Copied',
        description:
          'Share feature not available. Ad content copied instead.',
      });
    }
  };

  const handleTextToSpeech = async () => {
    setIsReadingAloud(true);
    try {
      const result = await textToSpeechAction(ad.content);
      if (result.error) {
        throw new Error(result.error);
      }
      const audio = new Audio(result.media);
      audio.play();
      audio.onended = () => setIsReadingAloud(false);
    } catch (error) {
      console.error('Text-to-speech failed:', error);
      toast({
        title: 'Read Aloud Failed',
        description:
          'Could not generate audio for this ad. Please try again.',
        variant: 'destructive',
      });
      setIsReadingAloud(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <Card className="flex flex-col overflow-hidden h-full bg-surface-2 border-border/50">
        <div className="bg-surface-1 flex items-center justify-center group">
          {ad.images && ad.images.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent>
                {ad.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative">
                      <Image
                        src={image}
                        alt={`${ad.title} - image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {ad.images.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CarouselNext className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="aspect-video flex items-center justify-center">
              {getPlaceholderIcon(ad.type)}
            </div>
          )}
        </div>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="font-headline text-xl pr-2 line-clamp-2">
              {ad.title}
            </CardTitle>
            <Badge
              variant={getBadgeVariant(ad.type)}
              className="capitalize flex-shrink-0"
            >
              {ad.type}
            </Badge>
          </div>
          <CardDescription>Created on {formatDate(ad.createdAt)}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2">
            {!isOpen && (
              <p className="text-sm text-text-secondary line-clamp-3">
                {ad.content}
              </p>
            )}
            <CollapsibleContent>
              <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none">
                {ad.content}
              </ReactMarkdown>
            </CollapsibleContent>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
          <CollapsibleTrigger asChild>
            <Button variant="link" className="p-0 h-auto text-xs">
              {isOpen ? 'Read less' : 'Read more'}
              <ChevronsUpDown className="h-3 w-3 ml-1" />
            </Button>
          </CollapsibleTrigger>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleTextToSpeech}
              disabled={isReadingAloud}
            >
              {isReadingAloud ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span className="sr-only">Read ad aloud</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShareAd}
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share ad</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Collapsible>
  );
};

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const firestore = useFirestore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const { toast } = useToast();

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Profile URL Copied!',
      description: 'The link to this public ad page is ready to be shared.',
    });
  };

  const userAdsCollection = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return collection(firestore, `users/${userId}/ads`);
  }, [firestore, userId]);

  const { data: ads, isLoading: isLoadingAds } =
    useCollection<Ad>(userAdsCollection);

  useEffect(() => {
    if (!firestore || !userId) return;

    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      const userDocRef = doc(firestore, 'users', userId);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setProfileNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfileNotFound(true);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [firestore, userId]);

  if (profileNotFound) {
    notFound();
  }

  const sortedAds = [...(ads || [])].sort((a, b) => {
    const dateA = a.createdAt?.toDate
      ? a.createdAt.toDate()
      : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate
      ? b.createdAt.toDate()
      : new Date(b.createdAt);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
    return dateB.getTime() - dateA.getTime();
  });

  const isLoading = isLoadingAds || isLoadingProfile;

  if (isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-12">
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 gap-4">
        {userProfile && (
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={userProfile.photoURL}
                alt={userProfile.displayName}
              />
              <AvatarFallback>
                {userProfile.displayName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl text-left">
                {userProfile.displayName}'s Ads
              </h1>
              <p className="mt-1 text-text-secondary text-left">
                Browse all the ads posted by this user.
              </p>
            </div>
          </div>
        )}
        <Button onClick={handleShareProfile} variant="outline">
          <Share2 className="mr-2 h-4 w-4" /> Share Profile
        </Button>
      </div>

      {!sortedAds || sortedAds.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-full text-center py-16 bg-surface-2 rounded-xl">
          <Package className="mx-auto h-16 w-16 text-text-secondary opacity-50" />
          <h2 className="mt-4 font-headline text-3xl font-bold">
            No Ads Found
          </h2>
          <p className="mt-2 text-text-secondary">
            This user hasn't posted any ads yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedAds.map((ad, i) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <AdCard ad={ad} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

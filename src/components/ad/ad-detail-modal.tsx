
'use client';

import { Ad } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import {
  Car,
  Search,
  Briefcase,
  Package,
  Home,
  Volume2,
  Share2,
  Loader2,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { textToSpeechAction } from '@/lib/actions';
import { useState } from 'react';

interface AdDetailModalProps {
  ad: Ad;
  isOpen: boolean;
  onClose: () => void;
}

export function AdDetailModal({ ad, isOpen, onClose }: AdDetailModalProps) {
    const { toast } = useToast();
    const [isReadingAloud, setIsReadingAloud] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);


  const getBadgeVariant = (type: Ad['type']) => {
    switch (type) {
      case 'sale':
      case 'item':
        return 'default';
      case 'wanted':
      case 'service':
      case 'real-estate':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPlaceholderIcon = (type: Ad['type']) => {
    switch (type) {
      case 'sale':
        return <Car className="w-24 h-24 text-text-secondary opacity-50" />;
      case 'wanted':
        return <Search className="w-24 h-24 text-text-secondary opacity-50" />;
      case 'item':
        return <Package className="w-24 h-24 text-text-secondary opacity-50" />;
      case 'service':
        return (
          <Briefcase className="w-24 h-24 text-text-secondary opacity-50" />
        );
      case 'real-estate':
        return <Home className="w-24 h-24 text-text-secondary opacity-50" />;
      default:
        return null;
    }
  };

  const handleShareAd = async () => {
    const adUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: `Check out this ad: ${ad.title}`,
          url: adUrl,
        });
        toast({
          title: 'Ad Shared!',
          description: 'The ad link has been shared.',
        });
      } catch (error) {
        console.log('Share was cancelled or failed', error);
      }
    } else {
      navigator.clipboard.writeText(adUrl);
      toast({
        title: 'Ad Link Copied',
        description: 'Share feature not available. Link copied instead.',
      });
    }
  };
  
  const handleTextToSpeech = async () => {
    if (audio) {
      audio.pause();
      setAudio(null);
      setIsReadingAloud(false);
      return;
    }

    setIsReadingAloud(true);
    try {
      const result = await textToSpeechAction(ad.content);
      if (result.error) {
        throw new Error(result.error);
      }
      const newAudio = new Audio(result.media);
      setAudio(newAudio);
      newAudio.play();
      newAudio.onended = () => {
        setIsReadingAloud(false);
        setAudio(null);
      };
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="pr-12">
            <div className="flex justify-between items-start">
                <DialogTitle className="font-headline text-2xl">{ad.title}</DialogTitle>
                <Badge
                    variant={getBadgeVariant(ad.type)}
                    className="capitalize flex-shrink-0"
                >
                    {ad.type === 'sale' ? 'Vehicle' : ad.type}
                </Badge>
            </div>
            <DialogDescription>
                {`Posted by user on ${new Date(ad.createdAt).toLocaleDateString()}`}
            </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-4">
            {ad.images && ad.images.length > 0 ? (
                <Carousel className="w-full">
                    <CarouselContent>
                        {ad.images.map((image, index) => (
                            <CarouselItem key={index}>
                                <div className="aspect-video relative">
                                    <Image
                                        src={image}
                                        alt={`${ad.title} - image ${index + 1}`}
                                        fill
                                        className="object-contain rounded-md"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {ad.images.length > 1 && (
                        <>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                        </>
                    )}
                </Carousel>
            ) : (
                <div className="aspect-video flex items-center justify-center bg-muted rounded-md">
                    {getPlaceholderIcon(ad.type)}
                </div>
            )}
            
            <article className="prose dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown>{ad.content}</ReactMarkdown>
            </article>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
                variant="outline"
                size="sm"
                onClick={handleTextToSpeech}
                disabled={isReadingAloud && !audio}
                >
                {isReadingAloud && !audio ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <Volume2 className="h-4 w-4 mr-2" />
                )}
                {isReadingAloud ? "Stop" : "Read Aloud"}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleShareAd}
                >
                <Share2 className="h-4 w-4 mr-2" />
                Share
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

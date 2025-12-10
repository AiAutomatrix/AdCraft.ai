
'use client';

import { Ad } from '@/lib/types';
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
  Share2,
  Filter,
  Home,
  LayoutGrid,
  List,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useEffect, useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AdDetailModal } from '@/components/ad/ad-detail-modal';
import { ClientOnly } from '@/components/client-only';


function ClientFormattedDate({ timestamp }: { timestamp: string }) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // This code runs only on the client, after hydration.
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      setFormattedDate(date.toLocaleDateString());
    } else {
      setFormattedDate(timestamp); // Fallback to original string if invalid
    }
  }, [timestamp]);

  // Render nothing on the server and during initial client render to avoid mismatch.
  // The formatted date will appear after the component mounts on the client.
  return <>{formattedDate}</>;
}


type UserProfile = {
  displayName: string;
  email: string;
  photoURL: string;
};

const adTypes: Ad['type'][] = ['sale', 'wanted', 'item', 'service', 'real-estate'];

const AdCard = ({ ad, layout, onClick }: { ad: Ad, layout: 'list' | 'grid', onClick: () => void }) => {

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
        return <Car className="w-16 h-16 text-text-secondary opacity-50" />;
      case 'wanted':
        return <Search className="w-16 h-16 text-text-secondary opacity-50" />;
      case 'item':
        return <Package className="w-16 h-16 text-text-secondary opacity-50" />;
      case 'service':
        return (
          <Briefcase className="w-16 h-16 text-text-secondary opacity-50" />
        );
      case 'real-estate':
        return <Home className="w-16 h-16 text-text-secondary opacity-50" />;
      default:
        return null;
    }
  };

  const isListLayout = layout === 'list';

  return (
      <Card 
        onClick={onClick}
        className="flex flex-col overflow-hidden h-full bg-surface-2 border-border/50 break-inside-avoid cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        <div className="bg-surface-1 flex items-center justify-center group">
          {ad.images && ad.images.length > 0 ? (
            <Carousel className="w-full h-full pointer-events-none">
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
                  <CarouselPrevious className="absolute left-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto" />
                  <CarouselNext className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="aspect-video flex items-center justify-center">
              {getPlaceholderIcon(ad.type)}
            </div>
          )}
        </div>
        <CardHeader className={cn(!isListLayout && "p-4")}>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className={cn("font-headline pr-2 line-clamp-2", isListLayout ? "text-xl" : "text-base")}>
              {ad.title}
            </CardTitle>
            <Badge
              variant={getBadgeVariant(ad.type)}
              className="capitalize flex-shrink-0"
            >
              {ad.type === 'sale' ? 'Vehicle' : ad.type}
            </Badge>
          </div>
          <CardDescription>Created on <ClientFormattedDate timestamp={ad.createdAt as string} /></CardDescription>
        </CardHeader>
        {isListLayout && (
            <>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                  <p className="text-sm text-text-secondary line-clamp-3">
                    {ad.content}
                  </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
                <p className="text-primary text-xs font-semibold">View Details</p>
            </CardFooter>
            </>
        )}
      </Card>
  );
};

interface ProfilePageClientProps {
  initialUserProfile: UserProfile | null;
  initialAds: Ad[];
}

export default function ProfilePageClient({ initialUserProfile, initialAds }: ProfilePageClientProps) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  
  const [userProfile] = useState<UserProfile | null>(initialUserProfile);
  const [ads] = useState<Ad[]>(initialAds);
  
  const [activeFilters, setActiveFilters] = useState<Ad['type'][]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!initialUserProfile) {
      notFound();
    }
  }, [initialUserProfile]);

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.origin + `/profile/${userId}`);
    toast({
      title: 'Profile URL Copied!',
      description: 'The link to this public ad page is ready to be shared.',
    });
  };

  const handleFilterChange = (type: Ad['type'], checked: boolean) => {
    setActiveFilters(prev => {
        const newFilters = checked ? [...prev, type] : prev.filter(t => t !== type);
        return newFilters;
    });
  };

  const openAdModal = (ad: Ad) => {
    setSelectedAd(ad);
    const params = new URLSearchParams(searchParams.toString());
    params.set('ad', ad.id);
    router.replace(`/profile/${userId}?${params.toString()}`, { scroll: false });
  };

  const closeAdModal = () => {
    setSelectedAd(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('ad');
    router.replace(`/profile/${userId}?${params.toString()}`, { scroll: false });
  };

  const sortedAndFilteredAds = useMemo(() => {
    let filteredAds = [...ads];
    
    // Filter by selected ad types, but show all if no filters are selected
    if (activeFilters.length > 0) {
        filteredAds = filteredAds.filter(ad => activeFilters.includes(ad.type));
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        filteredAds = filteredAds.filter(ad => 
            ad.title.toLowerCase().includes(lowercasedQuery) || 
            ad.content.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    return filteredAds; // Already sorted by server
  }, [ads, activeFilters, searchQuery]);


  // Effect to open modal if 'ad' query param is present on load
  useEffect(() => {
    if (sortedAndFilteredAds.length > 0) {
      const adIdFromUrl = searchParams.get('ad');
      if (adIdFromUrl) {
        const adToOpen = sortedAndFilteredAds.find(ad => ad.id === adIdFromUrl);
        if (adToOpen) {
          setSelectedAd(adToOpen);
        }
      }
    }
  }, [sortedAndFilteredAds, searchParams]);


  if (!userProfile) {
    // This will be caught by the useEffect check, but as a fallback
    return <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-12"><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16"
    >
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-12 gap-4">
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
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search ads..."
                    className="pl-9 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className='flex gap-2'>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLayout(layout === 'list' ? 'grid' : 'list')}
              >
                {layout === 'list' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                <span className="sr-only">Toggle Layout</span>
              </Button>
              <ClientOnly>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className='w-full'>
                      <Filter className="mr-2 h-4 w-4" /> Filter ({activeFilters.length > 0 ? activeFilters.length : 'All'})
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="space-y-4">
                      <h4 className="font-medium leading-none">Filter Ad Types</h4>
                      <div className="grid gap-2">
                        {adTypes.map((type) => (
                          <div className="flex items-center space-x-2" key={type}>
                            <Checkbox
                              id={`filter-${type}`}
                              checked={activeFilters.includes(type)}
                              onCheckedChange={(checked) => handleFilterChange(type, !!checked)}
                            />
                            <Label htmlFor={`filter-${type}`} className="capitalize">
                              {type === 'sale' ? 'Vehicle' : type.replace('-', ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </ClientOnly>
              <Button onClick={handleShareProfile} variant="outline" className='w-full'>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
        </div>
      </div>

      {sortedAndFilteredAds.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-full text-center py-16 bg-surface-2 rounded-xl">
          <Package className="mx-auto h-16 w-16 text-text-secondary opacity-50" />
          <h2 className="mt-4 font-headline text-3xl font-bold">
            No Ads Found
          </h2>
          <p className="mt-2 text-text-secondary">
            {ads.length > 0 ? "No ads match the current filter or search." : "This user hasn't posted any ads yet."}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "gap-6",
            layout === 'list'
              ? "columns-1 md:columns-2 lg:columns-3 space-y-6"
              : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          )}
        >
          {sortedAndFilteredAds.map((ad, i) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={cn(layout === 'list' && 'break-inside-avoid')}
            >
              <AdCard ad={ad} layout={layout} onClick={() => openAdModal(ad)} />
            </motion.div>
          ))}
        </div>
      )}
      
      {selectedAd && (
        <AdDetailModal 
            ad={selectedAd}
            isOpen={!!selectedAd}
            onClose={closeAdModal}
        />
      )}
    </motion.div>
  );
}

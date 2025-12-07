
'use client';

import { Ad } from '@/lib/types';
import { useFirestoreAds } from '@/hooks/use-firestore-ads';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Car, Copy, Edit, FilePlus, Loader2, MoreVertical, Search, Share2, Trash2, Package, Briefcase, User, Filter, Home, LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useEffect, useState, useMemo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { useUser } from '@/firebase';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

const adTypes: Ad['type'][] = ['sale', 'wanted', 'item', 'service', 'real-estate'];

export default function SavedAdsPage() {
  const { ads, deleteAd, loading } = useFirestoreAds();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [activeFilters, setActiveFilters] = useState<Ad['type'][]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  
  useEffect(() => {
    if (!user && !isUserLoading) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleFilterChange = (type: Ad['type'], checked: boolean) => {
    setActiveFilters(prev => {
        const newFilters = checked ? [...prev, type] : prev.filter(t => t !== type);
        return newFilters;
    });
  };
  
  const sortedAndFilteredAds = useMemo(() => {
    if (!ads) return [];
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
    
    // Sort by creation date
    return filteredAds.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
        return dateB.getTime() - dateA.getTime();
      });
  }, [ads, activeFilters, searchQuery]);


  const handleDelete = async (adId: string) => {
    await deleteAd(adId);
    toast({ title: "Ad Deleted", description: "The ad has been successfully removed.", variant: "destructive" });
  };

  const copyAd = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to Clipboard", description: "The ad content is ready to be pasted." });
  };

  const handleEdit = (adId: string) => {
    router.push(`/edit/${adId}`);
  };

  const handleShareProfile = () => {
    if (!user) return;
    const profileUrl = `${window.location.origin}/profile/${user.uid}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'Profile URL Copied!',
      description: 'Your public ad page link is ready to be shared.',
    });
  };


  const handleShare = async (ad: Ad) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: ad.content,
        });
        toast({ title: "Shared successfully!" });
      } catch (error) {
        console.log('Share was cancelled or failed', error);
      }
    } else {
      copyAd(ad.content);
      toast({ title: "Browser not supported", description: "Share feature not available. Ad content copied to clipboard instead." });
    }
  };
  
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
        case 'sale': return <Car className="w-16 h-16 text-text-secondary opacity-50" />;
        case 'wanted': return <Search className="w-16 h-16 text-text-secondary opacity-50" />;
        case 'item': return <Package className="w-16 h-16 text-text-secondary opacity-50" />;
        case 'service': return <Briefcase className="w-16 h-16 text-text-secondary opacity-50" />;
        case 'real-estate': return <Home className="w-16 h-16 text-text-secondary opacity-50" />;
        default: return null;
    }
  }

  if (loading || isUserLoading) {
    return (
        <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-12">
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-col justify-center items-center h-full text-center">
                <h1 className="font-headline text-3xl font-bold">Authentication Required</h1>
                <p className="mt-2 text-text-secondary">
                    Please log in to view and manage your saved ads.
                </p>
                <Button asChild className="mt-6 font-semibold">
                    <Link href="/login">Login <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
            </div>
        </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 md:px-8 flex flex-1 items-center justify-center py-12 text-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
          <FilePlus className="mx-auto h-16 w-16 text-text-secondary" />
          <h1 className="mt-4 font-headline text-3xl font-bold">No Saved Ads Yet</h1>
          <p className="mt-2 text-text-secondary">
            Start by creating a new ad, and you'll find it here.
          </p>
          <Button asChild className="mt-6 font-semibold">
            <Link href="/create">Create Your First Ad <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </motion.div>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
            <div>
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">My Saved Ads</h1>
                <p className="mt-2 text-text-secondary">Here are all the ads you've crafted.</p>
            </div>
             
             <div className='flex flex-col sm:flex-row items-center gap-2'>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search ads..."
                        className="pl-9 w-full sm:w-auto"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className='flex items-center gap-2 w-full'>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setLayout(layout === 'list' ? 'grid' : 'list')}
                    >
                        {layout === 'list' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                        <span className="sr-only">Toggle Layout</span>
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full">
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
                                        id={`filter-saved-${type}`}
                                        checked={activeFilters.includes(type)}
                                        onCheckedChange={(checked) => handleFilterChange(type, !!checked)}
                                    />
                                    <Label htmlFor={`filter-saved-${type}`} className="capitalize">
                                        {type === 'sale' ? 'Vehicle' : type.replace('-', ' ')}
                                    </Label>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button asChild className="font-semibold w-full">
                        <Link href="/create">
                            <FilePlus className="mr-2 h-4 w-4" />
                            New
                        </Link>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/profile/${user.uid}`}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>View Public Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleShareProfile}>
                                <Share2 className="mr-2 h-4 w-4" />
                                <span>Share Profile Link</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
      </div>

      {sortedAndFilteredAds.length === 0 ? (
        <div className="text-center py-16 bg-surface-2 rounded-xl">
          <Package className="mx-auto h-16 w-16 text-text-secondary opacity-50" />
          <h2 className="mt-4 font-headline text-3xl font-bold">No Ads Found</h2>
          <p className="mt-2 text-text-secondary">No ads match your current filter or search.</p>
        </div>
      ) : (
        <div className={cn(
            "gap-6",
            layout === 'list'
                ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        )}>
          {sortedAndFilteredAds.map((ad, i) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="flex flex-col overflow-hidden h-full bg-surface-2 border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                <div className="bg-surface-1 flex items-center justify-center group">
                    {ad.images && ad.images.length > 0 ? (
                        <Carousel className="w-full h-full">
                            <CarouselContent>
                                {ad.images.map((image, index) => (
                                  <CarouselItem key={index}>
                                      <div className="aspect-video relative">
                                          <Image src={image} alt={`${ad.title} - image ${index + 1}`} fill className="object-cover" />
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
                <CardHeader className={cn(layout === 'grid' && 'p-4')}>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className={cn("font-headline pr-2 line-clamp-2", layout === 'list' ? 'text-xl' : 'text-base')}>
                        {ad.title}
                    </CardTitle>
                    <Badge variant={getBadgeVariant(ad.type)} className="capitalize flex-shrink-0">{ad.type === 'sale' ? 'Vehicle' : ad.type}</Badge>
                  </div>
                  <CardDescription>
                    Created on {formatDate(ad.createdAt)}
                  </CardDescription>
                </CardHeader>
                {layout === 'list' && (
                    <>
                        <CardContent className="flex-grow">
                        <p className="text-sm text-text-secondary line-clamp-3">{ad.content}</p>
                        </CardContent>
                        <CardFooter className="flex gap-2 justify-end mt-auto pt-4 border-t border-border/50">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(ad.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleShare(ad)}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    <span>Share Ad</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyAd(ad.content)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    <span>Copy Content</span>
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this ad.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(ad.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        </CardFooter>
                    </>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

'use client';

import { Ad } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Car, Copy, Edit, FilePlus, Loader2, MoreVertical, Search, Trash2 } from 'lucide-react';
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
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

export default function SavedAdsPage() {
  const [ads, setAds] = useLocalStorage<Ad[]>('saved-ads', []);
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sortedAds = [...ads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const deleteAd = (id: string) => {
    setAds(ads.filter(ad => ad.id !== id));
    toast({ title: "Ad Deleted", description: "The ad has been successfully removed.", variant: "destructive" });
  };

  const copyAd = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to Clipboard", description: "The ad content is ready to be pasted." });
  };

  if (!isClient) {
    return (
        <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-12">
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </div>
    );
  }

  if (ads.length === 0) {
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
        <div className="flex justify-between items-center mb-8 md:mb-12">
            <div>
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">My Saved Ads</h1>
                <p className="mt-2 text-text-secondary">Here are all the ads you've crafted.</p>
            </div>
            <Button asChild className="font-semibold hidden sm:flex">
                <Link href="/create">
                    <FilePlus className="mr-2 h-4 w-4" />
                    Create New Ad
                </Link>
            </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedAds.map((ad, i) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <Card className="flex flex-col overflow-hidden h-full bg-surface-2 border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
              <div className="aspect-video bg-surface-1 flex items-center justify-center relative">
                  {ad.images && ad.images.length > 0 ? (
                      <Image src={ad.images[0]} alt={ad.title} layout="fill" className="object-cover"/>
                  ) : (
                      ad.type === 'sale' ? <Car className="w-16 h-16 text-text-secondary opacity-50" /> : <Search className="w-16 h-16 text-text-secondary opacity-50" />
                  )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="font-headline text-xl pr-2 line-clamp-2">{ad.title}</CardTitle>
                  <Badge variant={ad.type === 'sale' ? 'default' : 'secondary'} className="capitalize flex-shrink-0">{ad.type}</Badge>
                </div>
                <CardDescription>
                  Created on {new Date(ad.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-text-secondary line-clamp-3">{ad.content}</p>
              </CardContent>
              <CardFooter className="flex gap-2 justify-end mt-auto pt-4 border-t border-border/50">
                <Button variant="outline" size="sm" onClick={() => router.push(`/edit/${ad.id}`)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                                This action cannot be undone. This will permanently delete this ad from your local storage.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteAd(ad.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>

              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

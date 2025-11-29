'use client';

import { Ad } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Copy, Edit, FilePlus, Loader2, Trash2 } from 'lucide-react';
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
    toast({ title: "Ad Deleted", description: "The ad has been successfully removed." });
  };

  const copyAd = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to Clipboard", description: "The ad content is ready to be pasted." });
  };

  if (!isClient) {
    return (
        <div className="container py-12">
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="container flex flex-1 items-center justify-center py-12 text-center">
        <div>
          <FilePlus className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 font-headline text-3xl font-bold">No Saved Ads Yet</h1>
          <p className="mt-2 text-muted-foreground">
            Start by creating a new ad, and you'll find it here.
          </p>
          <Button asChild className="mt-6 font-semibold">
            <Link href="/create">Create Your First Ad <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">My Saved Ads</h1>
                <p className="mt-2 text-muted-foreground">Here are all the ads you've crafted.</p>
            </div>
            <Button asChild className="font-semibold">
                <Link href="/create">
                    <FilePlus className="mr-2 h-4 w-4" />
                    Create New Ad
                </Link>
            </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedAds.map(ad => (
          <Card key={ad.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="font-headline text-xl pr-2 line-clamp-2">{ad.title}</CardTitle>
                <Badge variant={ad.type === 'sale' ? 'default' : 'secondary'}>{ad.type}</Badge>
              </div>
              <CardDescription>
                Created on {new Date(ad.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-4">{ad.content}</p>
            </CardContent>
            <CardFooter className="flex gap-2 justify-end">
              <Button variant="ghost" size="icon" onClick={() => copyAd(ad.content)} title="Copy">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push(`/edit/${ad.id}`)} title="Edit">
                <Edit className="h-4 w-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" title="Delete">
                        <Trash2 className="h-4 w-4" />
                    </Button>
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
                    <AlertDialogAction onClick={() => deleteAd(ad.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

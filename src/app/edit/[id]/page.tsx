'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirestoreAds } from '@/hooks/use-firestore-ads';
import { useToast } from '@/hooks/use-toast';
import type { Ad } from '@/lib/types';
import { suggestAdImprovementsAction } from '@/lib/actions';
import { useUser } from '@/firebase';
import { processImage } from '@/lib/image-utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


import { ArrowLeft, Copy, Loader2, Save, Sparkles, Trash2, Wand2, Upload, X, Search, Briefcase, PlusCircle, LayoutGrid, RectangleHorizontal, Image as ImageIcon } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';


const adSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  content: z.string().min(10, 'Ad content must be at least 10 characters long.'),
});

type AdFormData = z.infer<typeof adSchema>;

type AISuggestions = {
    improvedAdCopy: string;
    suggestions: string[];
}

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const { ads, setAd, deleteAd, loading: adsLoading } = useFirestoreAds();

  const { user, isUserLoading } = useUser();
  const [ad, setLocalAd] = useState<Ad | null>(null);
  
  const [isNew, setIsNew] = useState(false);
  
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isImproveDialogOpen, setIsImproveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [imageView, setImageView] = useState<'grid' | 'carousel'>('grid');
  
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: { title: '', content: '' },
  });

  // This effect handles the initial loading of ad data, either from
  // session storage (for a new ad) or from Firestore (for an existing ad).
  useEffect(() => {
    if (isUserLoading || adsLoading || initialDataLoaded) return;
    
    if (!user) {
        toast({ title: 'Authentication Required', description: 'You must be logged in to edit ads.', variant: 'destructive' });
        router.replace('/login');
        return;
    }

    const newAdDataString = sessionStorage.getItem('generatedAd_new');
    const isCreatingNewAd = id === 'new' || !!newAdDataString;
    setIsNew(isCreatingNewAd);

    let adDataToSet: Ad | null = null;
    
    if (isCreatingNewAd && newAdDataString) {
      try {
        const parsedData = JSON.parse(newAdDataString);
        adDataToSet = {
          id: parsedData.id,
          createdAt: new Date().toISOString(),
          ...parsedData,
        };
        setActiveTab('edit');
      } catch (e) {
        console.error("Failed to parse ad data from session storage", e);
        toast({ title: 'Error loading ad data', variant: 'destructive' });
        router.replace('/create');
        return;
      }
    } else {
        if (ads) {
            const existingAd = ads.find(a => a.id === id);
            if (existingAd) {
                adDataToSet = existingAd;
                setActiveTab(existingAd.images && existingAd.images.length > 0 ? 'preview' : 'edit');
            } else if (!isCreatingNewAd) { // Only show not found if it's not a new ad being created
                toast({ title: 'Ad not found', variant: 'destructive' });
                router.replace('/saved');
                return;
            }
        }
    }

    if (adDataToSet) {
        setLocalAd(adDataToSet);
        form.reset({ title: adDataToSet.title, content: adDataToSet.content });
    } else if (isCreatingNewAd && !newAdDataString) {
        // If /edit/new is accessed directly or refreshed, no data will be in session storage.
        toast({ title: 'No ad data found', description: 'Please create an ad first.', variant: 'destructive' });
        router.replace('/create');
        return;
    }

    if (adDataToSet || (!isCreatingNewAd && ads && !ads.find(a => a.id === id))) {
      setInitialDataLoaded(true);
    }
    
  }, [id, form, router, toast, ads, adsLoading, isUserLoading, user, initialDataLoaded]);


  const onSubmit = async (data: AdFormData) => {
    if (!user || !ad) return;
    
    setIsSaving(true);
    const adId = ad.id;
    
    try {
      const adToSave: Ad = {
        ...ad,
        id: adId,
        title: data.title,
        content: data.content,
        userId: user.uid,
      };
      
      await setAd(adToSave);
      
      toast({ title: 'Ad Saved!', description: 'Your ad has been successfully saved.' });
      sessionStorage.removeItem('generatedAd_new');
      
      router.push('/saved');

    } catch(e) {
      console.error(e);
      toast({ title: 'Save Failed', description: 'Could not save your ad. Please try again.', variant: 'destructive' });
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (ad && !isNew) {
      await deleteAd(ad.id);
      toast({ title: 'Ad Deleted', variant: 'destructive' });
      router.push('/saved');
    }
  };

  const handleCopy = async () => {
    const content = form.getValues('content');
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: 'Copied to Clipboard!' });
    } catch (err) {
      console.error('Failed to copy text using navigator: ', err);
    }
  };
  
  const handleImproveWithAI = async () => {
    if (!ad) return;
    setIsImproving(true);
    setAiSuggestions(null);
    setIsImproveDialogOpen(true);

    const currentValues = form.getValues();
    const result = await suggestAdImprovementsAction({
        adCopy: currentValues.content,
        adType: ad.type,
    });

    if (result.error) {
        toast({ title: "AI Improvement Failed", description: result.error, variant: 'destructive' });
        setIsImproveDialogOpen(false);
    } else if ('improvedAdCopy' in result) {
        setAiSuggestions(result);
    }
    setIsImproving(false);
  };
  
  const applyAISuggestions = () => {
    if (aiSuggestions) {
        form.setValue('content', aiSuggestions.improvedAdCopy, { shouldValidate: true });
        toast({ title: 'AI Suggestions Applied!', description: 'The ad content has been updated.' });
        setIsImproveDialogOpen(false);
        setActiveTab('preview');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
  
    setIsProcessingImage(true);
    try {
      const imagePromises = Array.from(files).map(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast({
            title: `Image ${file.name} too large`,
            description: 'Please select images smaller than 10MB.',
            variant: 'destructive',
          });
          return Promise.resolve(null);
        }
        return processImage(file);
      });
  
      const processedImages = (await Promise.all(imagePromises)).filter((img): img is string => img !== null);
      
      setLocalAd(prev => {
        if (!prev) return null;
        const newImages = [...(prev.images || []), ...processedImages];
        return { ...prev, images: newImages };
      });
  
    } catch (error) {
      console.error("Image processing failed:", error);
      toast({
        title: 'Image Processing Failed',
        description: 'Could not process the selected images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingImage(false);
      // Clear the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  

  const removeImage = (index: number) => {
    setLocalAd(prev => {
        if (!prev || !prev.images) return prev;
        const newImages = [...prev.images];
        newImages.splice(index, 1);
        return {...prev, images: newImages};
    });
  };

  if (adsLoading || isUserLoading || !initialDataLoaded || !ad) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  const adContent = form.watch('content');
  const adTitle = form.watch('title');
  
  const showImageManager = (ad?.type === 'sale' || ad?.type === 'item' || ad?.type === 'service') && activeTab === 'edit';

  return (
    <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className={cn("grid gap-8", showImageManager && "md:grid-cols-2")}>
                {showImageManager && (
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="font-headline text-2xl">Images</CardTitle>
                                <CardDescription>Manage images for your ad.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setImageView(imageView === 'grid' ? 'carousel' : 'grid')}
                                    disabled={!ad.images || ad.images.length === 0}
                                >
                                    {imageView === 'grid' ? <RectangleHorizontal className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isSaving || isProcessingImage}
                                >
                                    {isProcessingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                                </Button>
                            </div>
                        </CardHeader>
                     <CardContent>
                       <input
                         type="file"
                         accept="image/*"
                         multiple
                         ref={fileInputRef}
                         onChange={handleFileChange}
                         className="hidden"
                         disabled={isSaving || isProcessingImage}
                       />
                        {(!ad.images || ad.images.length === 0) ? (
                            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-muted/20">
                                 <ImageIcon className="w-24 h-24 text-muted-foreground/50" />
                                 <p className="text-muted-foreground mt-2">No images yet.</p>
                                 <p className="text-sm text-muted-foreground">Click the upload icon to add some.</p>
                            </div>
                        ) : imageView === 'grid' ? (
                            <div className="grid grid-cols-3 gap-4">
                                {(ad.images || []).map((image, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <Image
                                    src={image}
                                    alt={`Ad image ${index + 1}`}
                                    fill
                                    className="rounded-md object-cover"
                                    />
                                    <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                    disabled={isSaving}
                                    >
                                    <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                ))}
                            </div>
                        ) : (
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {(ad.images || []).map((image, index) => (
                                    <CarouselItem key={index}>
                                        <div className="relative aspect-video">
                                            <Image
                                                src={image}
                                                alt={`Ad image ${index + 1}`}
                                                fill
                                                className="rounded-md object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-7 w-7"
                                                onClick={() => removeImage(index)}
                                                disabled={isSaving}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </Carousel>
                        )}
                     </CardContent>
                   </Card>
                )}
                
                <Card className={cn(!showImageManager && "md:col-span-2")}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="font-headline text-3xl">Ad Editor</CardTitle>
                                <CardDescription>
                                    {isNew ? "Here's your new AI-generated ad. Refine it and save it." : "Edit your saved ad."}
                                </CardDescription>
                            </div>
                            <Badge variant={ad.type === 'sale' || ad.type === 'item' ? 'default' : 'secondary'} className="capitalize text-sm">{ad.type}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                <FormItem className='mb-4'>
                                    <div className="flex justify-between items-center">
                                        <FormLabel className="text-lg">Ad Title</FormLabel>
                                    </div>
                                    <FormControl>
                                    <Input placeholder="e.g., For Sale: 2020 Ford Mustang" {...field} className="text-base" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Ad Content</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder="Your ad copy will appear here..." {...field} className="min-h-[300px] text-base" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </TabsContent>
                        <TabsContent value="preview" className="prose dark:prose-invert prose-sm max-w-none rounded-md border bg-card p-4 min-h-[398px]">
                            {ad.images && ad.images.length > 0 && (
                                <Carousel className="w-full mb-4 -mt-2">
                                    <CarouselContent>
                                        {ad.images.map((image, index) => (
                                            <CarouselItem key={index}>
                                                <Image
                                                    src={image}
                                                    alt={`Ad image ${index + 1}`}
                                                    width={600}
                                                    height={400}
                                                    className="rounded-md object-cover w-full aspect-video"
                                                />
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
                            )}
                            <h2 className="font-headline text-2xl mt-0">{adTitle}</h2>
                            <ReactMarkdown>{adContent}</ReactMarkdown>
                        </TabsContent>
                    </Tabs>
                    </CardContent>
                </Card>
            </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="flex gap-2">
                {!isNew && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. This will permanently delete this ad.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                 <Dialog open={isImproveDialogOpen} onOpenChange={(open) => { setIsImproveDialogOpen(open); if (!open) setAiSuggestions(null); }}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" onClick={handleImproveWithAI} className="bg-secondary/20 text-secondary-foreground border-secondary/30 hover:bg-secondary/30">
                            {isImproving && !aiSuggestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" /> }
                            Improve with AI
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                         <DialogHeader>
                            <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> AI-Powered Improvements</DialogTitle>
                            <DialogDescription>Here are suggestions based on your ad content to make your ad even better.</DialogDescription>
                        </DialogHeader>
                        {isImproving && !aiSuggestions ? (
                             <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : aiSuggestions ? (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Suggested New Version:</h3>
                                    <blockquote className="border-l-2 border-primary pl-4 py-2 bg-surface-2 rounded-r-md">
                                        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">{aiSuggestions.improvedAdCopy}</ReactMarkdown>
                                    </blockquote>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold mb-2">Specific Suggestions:</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                        {aiSuggestions.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <Button onClick={applyAISuggestions} className="w-full mt-4">Apply Suggestions</Button>
                            </div>
                        ) : (
                            <div className="text-center p-8">Could not load AI suggestions. Please try again.</div>
                        )}
                    </DialogContent>
                 </Dialog>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isNew ? 'Save Ad' : 'Update Ad'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

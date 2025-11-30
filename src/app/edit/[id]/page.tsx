'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirestoreAds } from '@/hooks/use-firestore-ads';
// import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import { useToast } from '@/hooks/use-toast';
import type { Ad } from '@/lib/types';
import { suggestAdImprovementsAction, generateAdTitleAction } from '@/lib/actions';
import { useUser } from '@/firebase';

import { ArrowLeft, Copy, Loader2, Save, Sparkles, Trash2, Wand2, RefreshCw, Upload, X } from 'lucide-react';
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

  const { getAd, setAd, deleteAd, loading: adsLoading } = useFirestoreAds();
  // const { uploadImage, deleteImage } = useFirebaseStorage();

  const { user, isUserLoading } = useUser();
  const [ad, setLocalAd] = useState<Ad | null>(null);
  const [isNew, setIsNew] = useState(id === 'new');
  
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null); // Holds data URI
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: { title: '', content: '' },
  });

  useEffect(() => {
    if (adsLoading || isUserLoading) return;
    
    if (!user) {
        toast({ title: 'Authentication Required', description: 'You must be logged in to edit ads.', variant: 'destructive' });
        router.replace('/login');
        return;
    }

    if (isNew) {
      const newAdData = sessionStorage.getItem('generatedAd_new');
      if (newAdData) {
        try {
          const parsedData = JSON.parse(newAdData);
          const adData: Ad = {
            id: 'new', // Temporary ID
            createdAt: new Date().toISOString(),
            ...parsedData,
          };
          setLocalAd(adData);
          form.reset({ title: adData.title, content: adData.content });
          if(parsedData.images && parsedData.images[0]) {
            setImageFile(parsedData.images[0]);
          }

        } catch (e) {
          console.error("Failed to parse ad data from session storage", e);
          toast({ title: 'Error loading ad data', variant: 'destructive' });
          router.replace('/create');
        }
      } else if (!initialDataLoaded) {
        toast({ title: 'No ad data found', description: 'Please create an ad first.', variant: 'destructive' });
        router.replace('/create');
        return;
      }
      setInitialDataLoaded(true);
    } else {
      getAd(id).then(adData => {
        if (adData) {
          setLocalAd(adData);
          form.reset({ title: adData.title, content: adData.content });
        } else {
          toast({ title: 'Ad not found', variant: 'destructive' });
          router.replace('/saved');
        }
        setInitialDataLoaded(true);
      })
    }

  }, [id, isNew, form, router, toast, adsLoading, isUserLoading, initialDataLoaded, getAd, user]);

  const onSubmit = async (data: AdFormData) => {
    setIsSaving(true);
    const newId = isNew ? uuidv4() : id;
    
    try {
      // Step 1: Upload image (COMMENTED OUT)
      // if (imageFile && imageFile.startsWith('data:image')) {
      //   await uploadImage(imageFile, newId);
      //   toast({ title: 'Image Uploaded!', description: 'Your image has been saved to storage.' });
      // }

      // Step 2: Save text data to Firestore
      const adToSave: Ad = {
        id: newId,
        type: ad?.type || 'sale',
        createdAt: ad?.createdAt || null,
        title: data.title,
        content: data.content,
      };
      
      const savedAd = await setAd(adToSave);
      setLocalAd(savedAd);

      if (isNew) {
          sessionStorage.removeItem('generatedAd_new');
      }
      toast({ title: 'Ad Saved!', description: 'Your ad text has been successfully saved.' });
      
      if (isNew) {
        router.replace(`/edit/${newId}`, { scroll: false });
        setIsNew(false);
      }
    } catch(e) {
      console.error(e);
      toast({ title: 'Save Failed', description: 'Could not save your ad. Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleDelete = async () => {
    if (ad && !isNew) {
      // try {
      //   await deleteImage(ad.id); // Attempt to delete image with same ID as ad
      // } catch (error) {
      //   console.warn("Could not delete image from storage, it might not exist.", error);
      // }
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
    setIsImproving(true);
    setAiSuggestions(null);

    const currentValues = form.getValues();
    const result = await suggestAdImprovementsAction({
        adCopy: currentValues.content,
        adType: ad?.type || 'sale',
    });

    if (result.error) {
        toast({ title: "AI Improvement Failed", description: result.error, variant: 'destructive' });
    } else if ('improvedAdCopy' in result) {
        setAiSuggestions(result);
    }
    setIsImproving(false);
  };

  const handleGenerateTitle = async () => {
    setIsGeneratingTitle(true);
    const currentValues = form.getValues();
    const result = await generateAdTitleAction({
        adContent: currentValues.content,
        adType: ad?.type || 'sale',
    });

    if (result.error) {
        toast({ title: "Title Generation Failed", description: result.error, variant: 'destructive' });
    } else if (result.title) {
        form.setValue('title', result.title, { shouldValidate: true });
        toast({ title: 'New Title Generated!', description: 'The ad title has been updated.' });
    }
    setIsGeneratingTitle(false);
  };
  
  const applyAISuggestions = () => {
    if (aiSuggestions) {
        form.setValue('content', aiSuggestions.improvedAdCopy, { shouldValidate: true });
        toast({ title: 'AI Suggestions Applied!', description: 'The ad content has been updated.' });
    }
  };

  if (!initialDataLoaded || !ad) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  const adContent = form.watch('content');
  const adType = ad?.type || 'sale';

  return (
    <div className="container py-12 max-w-6xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                {/* <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Vehicle Image</CardTitle>
                        <CardDescription>Upload an image for AI analysis (optional). It is not saved with the ad.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isSaving}
                        />
                        {imageFile ? (
                            <div className="relative group">
                                <Image
                                src={imageFile}
                                alt="Vehicle preview"
                                width={600}
                                height={400}
                                className="rounded-lg object-cover w-full aspect-video"
                                />
                                <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={removeImage}
                                    disabled={isSaving}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSaving || !isNew}
                                className="w-full h-64 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Upload className="h-10 w-10 mb-2" />
                                <span>Click to upload a photo</span>
                                <span className="text-sm">Only for new ads</span>
                            </button>
                        )}
                    </CardContent>
                </Card> */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="font-headline text-3xl">Ad Editor</CardTitle>
                                <CardDescription>
                                    {isNew ? "Here's your new AI-generated ad. Refine it and save it." : "Edit your saved ad."}
                                </CardDescription>
                            </div>
                            <Badge variant={adType === 'sale' ? 'default' : 'secondary'} className="capitalize text-sm">{adType}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center">
                                <FormLabel className="text-lg">Ad Title</FormLabel>
                                <Button type="button" size="sm" variant="ghost" onClick={handleGenerateTitle} disabled={isGeneratingTitle}>
                                    {isGeneratingTitle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    Generate
                                </Button>
                            </div>
                            <FormControl>
                            <Input placeholder="e.g., For Sale: 2020 Ford Mustang" {...field} className="text-base" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Tabs defaultValue="edit" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit">
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Ad Content</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder="Your ad copy will appear here..." {...field} className="min-h-[250px] text-base" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </TabsContent>
                        <TabsContent value="preview" className="prose dark:prose-invert prose-sm max-w-none min-h-[282px] rounded-md border bg-card p-4">
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
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                 <Dialog onOpenChange={(open) => !open && setAiSuggestions(null)}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" onClick={handleImproveWithAI} className="bg-accent/10 text-accent-foreground border-accent/30 hover:bg-accent/20">
                            {isImproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Improve with AI
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                         <DialogHeader>
                            <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> AI-Powered Improvements</DialogTitle>
                            <DialogDescription>Here are suggestions based on your ad content to make your ad even better.</DialogDescription>
                        </DialogHeader>
                        {isImproving ? (
                             <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : aiSuggestions ? (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Suggested New Version:</h3>
                                    <blockquote className="border-l-2 border-primary pl-4 py-2 bg-secondary/30 rounded-r-md">
                                        <p className="text-sm text-foreground">{aiSuggestions.improvedAdCopy}</p>
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

    
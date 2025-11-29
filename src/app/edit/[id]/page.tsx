'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import type { Ad } from '@/lib/types';
import { suggestAdImprovementsAction } from '@/lib/actions';

import { ArrowLeft, Copy, Loader2, Save, Sparkles, Trash2, Wand2 } from 'lucide-react';
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

  const [ads, setAds] = useLocalStorage<Ad[]>('saved-ads', []);
  const [ad, setAd] = useState<Ad | null>(null);
  const [isNew, setIsNew] = useState(id === 'new');

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: { title: '', content: '' },
  });

  const adData = useMemo(() => {
    if (isNew) {
      const newAdData = sessionStorage.getItem('generatedAd_new');
      if (newAdData) {
        const parsedData = JSON.parse(newAdData);
        return {
          id: 'new',
          createdAt: new Date().toISOString(),
          ...parsedData,
        };
      }
      return null;
    }
    return ads.find(a => a.id === id) || null;
  }, [id, ads, isNew]);

  useEffect(() => {
    if (adData) {
      setAd(adData);
      form.reset({ title: adData.title, content: adData.content });
    } else {
      toast({ title: 'Ad not found', variant: 'destructive' });
      router.replace('/saved');
    }
  }, [adData, form, router, toast]);

  const onSubmit = (data: AdFormData) => {
    setIsSaving(true);
    const newAd: Ad = {
      id: isNew ? uuidv4() : id,
      type: ad?.type || 'sale',
      createdAt: ad?.createdAt || new Date().toISOString(),
      ...data,
    };
    
    setAds(isNew ? [...ads, newAd] : ads.map(a => (a.id === id ? newAd : a)));
    if (isNew) {
        sessionStorage.removeItem('generatedAd_new');
    }
    toast({ title: 'Ad Saved!', description: 'Your ad has been successfully saved.' });
    router.push(`/edit/${newAd.id}`);
    setIsNew(false);
    setIsSaving(false);
  };

  const handleDelete = () => {
    setAds(ads.filter(a => a.id !== id));
    toast({ title: 'Ad Deleted', variant: 'destructive' });
    router.push('/saved');
  };

  const handleCopy = () => {
    const content = form.getValues('content');
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to Clipboard!' });
  };
  
  const handleImproveWithAI = async () => {
    setIsImproving(true);
    const currentContent = form.getValues('content');
    const result = await suggestAdImprovementsAction({
        adCopy: currentContent,
        vehicleDescription: '', // Can be enhanced later
        adType: ad?.type || 'sale'
    });

    if (result.error) {
        toast({ title: "AI Improvement Failed", description: result.error, variant: 'destructive' });
    } else if ('improvedAdCopy' in result) {
        setAiSuggestions(result);
    }
    setIsImproving(false);
  };
  
  const applyAISuggestions = () => {
    if (aiSuggestions) {
        form.setValue('content', aiSuggestions.improvedAdCopy, { shouldValidate: true });
        toast({ title: 'AI Suggestions Applied!', description: 'The ad content has been updated.' });
    }
  };


  if (!ad) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container py-12">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-3xl">Ad Editor</CardTitle>
                        <CardDescription>
                            {isNew ? "Here's your new AI-generated ad. Refine it and save it." : "Edit your saved ad."}
                        </CardDescription>
                    </div>
                    <Badge variant={ad.type === 'sale' ? 'default' : 'secondary'} className="capitalize text-sm">{ad.type}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Ad Title</FormLabel>
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
                    <FormLabel className="text-lg">Ad Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Your ad copy will appear here..." {...field} className="min-h-[300px] text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" onClick={handleImproveWithAI} className="bg-accent/10 text-accent-foreground border-accent/30 hover:bg-accent/20">
                            {isImproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Improve with AI
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                         <DialogHeader>
                            <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> AI-Powered Improvements</DialogTitle>
                            <DialogDescription>Here are suggestions to make your ad even better.</DialogDescription>
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
                            <div className="text-center p-8">No suggestions available.</div>
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

    
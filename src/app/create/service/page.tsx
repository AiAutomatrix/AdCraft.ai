'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateServiceAdFromTextAction } from '@/lib/actions';
import { Loader2, Wand2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';

export default function GenerateServiceAd() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: 'Description is empty',
        description: 'Please describe the service you are offering.',
        variant: 'destructive',
      });
      return;
    }
    
    if (isUserLoading) {
        toast({
          title: 'Please wait',
          description: 'User data is still loading. Please try again in a moment.',
        });
        return;
    }
  
    if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'You must be logged in to generate an ad.',
          variant: 'destructive',
        });
        router.push('/login');
        return;
    }

    setIsGenerating(true);
    const newAdId = uuidv4();
    try {
      const result = await generateServiceAdFromTextAction(description);

      if (result.error) {
        throw new Error(result.error);
      }
      
      sessionStorage.setItem('generatedAd_new', JSON.stringify({
        id: newAdId,
        title: result.title,
        content: result.adText,
        type: 'service',
        images: []
      }));
      router.push(`/edit/${newAdId}`);

    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: (error as Error).message || 'Could not generate ad. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Generate an Ad for a Service</CardTitle>
          <CardDescription>Describe the service you offer, and our AI will write a professional ad for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Service Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 'Professional residential and commercial painting services. Interior, exterior, and cabinet painting. Free estimates and fully insured. Serving the greater Springfield area for over 10 years.'"
              className="min-h-[150px] text-base"
              disabled={isGenerating}
            />
             <p className="text-sm text-muted-foreground">
              Be as specific as you like. Include your skills, experience, service area, and how to contact you.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={!description || isGenerating || isUserLoading} className="w-full font-semibold" size="lg">
            {isGenerating ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            Generate Ad
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateSaleAdFromTextAction } from '@/lib/actions';
import { Loader2, Wand2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function GenerateSaleAdPage() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: 'Description is empty',
        description: 'Please describe the vehicle you are selling.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateSaleAdFromTextAction(description);

      if (result.error) {
        throw new Error(result.error);
      }
      
      sessionStorage.setItem('generatedAd_new', JSON.stringify({
        title: result.title,
        content: result.adText,
        type: 'sale'
      }));
      router.push('/edit/new');

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
          <CardTitle className="font-headline text-3xl">Generate a 'For Sale' Ad</CardTitle>
          <CardDescription>Describe the vehicle you're selling, and our AI will write a professional, compelling ad for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Your Vehicle's Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 'Selling my 2020 Tesla Model 3 Long Range. It has 25,000 miles, white exterior, black interior. Full self-driving package included. Excellent condition, no accidents. New tires recently installed.'"
              className="min-h-[150px] text-base"
              disabled={isGenerating}
            />
             <p className="text-sm text-muted-foreground">
              Be as specific as you like. Include make, model, year, mileage, condition, and any special features.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={!description || isGenerating} className="w-full font-semibold" size="lg">
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

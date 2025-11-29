'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateWantedAdAction } from '@/lib/actions';
import { Loader2, Wand2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function GenerateWantedAd() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: 'Description is empty',
        description: 'Please describe the vehicle you are looking for.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateWantedAdAction(description);

      if (result.error) {
        throw new Error(result.error);
      }
      
      sessionStorage.setItem('generatedAd_new', JSON.stringify({
        title: `Wanted: ${description.substring(0, 30)}...`,
        content: result,
        type: 'wanted'
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
          <CardTitle className="font-headline text-3xl">Generate a 'Wanted' Ad</CardTitle>
          <CardDescription>Describe the vehicle you're looking for, and our AI will write a clear and concise "wanted" ad.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Vehicle Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 'Looking for a reliable, fuel-efficient sedan, 2018 or newer, under 80,000 miles. Preferably a Toyota Camry or Honda Accord. Must have a clean title and service history. My budget is around $15,000.'"
              className="min-h-[150px] text-base"
              disabled={isGenerating}
            />
             <p className="text-sm text-muted-foreground">
              Be as specific as you like. Include make, model, year, condition, and your budget.
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

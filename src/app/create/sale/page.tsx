'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateAdFromImageAction } from '@/lib/actions';
import { Loader2, Wand2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/firebase';

export default function GenerateSaleAdPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: 'Image too large',
          description: 'Please select an image smaller than 2MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imagePreview) {
      toast({
        title: 'No image selected',
        description: 'Please select an image to generate an ad.',
        variant: 'destructive',
      });
      return;
    }

    if (isUserLoading) {
      toast({
        title: 'Please wait',
        description: 'User data is still loading. Please try again in a moment.',
        variant: 'destructive',
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
      // 1. Generate the ad using the data URI (for AI)
      const result = await generateAdFromImageAction({
        photoDataUri: imagePreview,
        adType: 'sell',
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // 2. Pass all data to the editor page via session storage
      sessionStorage.setItem('generatedAd_new', JSON.stringify({
        id: newAdId,
        title: result.title,
        content: result.adText,
        type: 'sale',
        images: [imagePreview], // Pass the base64 data URI
      }));
      router.push(`/edit/${newAdId}`);

    } catch (error) {
      console.error('An error occurred during the ad generation process:', error);
      toast({
        title: 'Generation Failed',
        description: (error as Error).message || 'Could not generate ad. Please check the console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const clearImage = () => {
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const isButtonDisabled = isGenerating || !imagePreview;

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Generate a 'For Sale' Ad from a Photo</CardTitle>
          <CardDescription>Upload a picture of your vehicle. The image will be stored in your browser and our AI will write an ad for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={isGenerating}
            />
            {imagePreview ? (
              <div className="relative group">
                <Image
                  src={imagePreview}
                  alt="Vehicle preview"
                  width={600}
                  height={400}
                  className="rounded-lg object-cover w-full aspect-video"
                />
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={clearImage}
                    disabled={isGenerating}
                >
                    <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating || isUserLoading}
                className="w-full h-64 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary transition-colors"
              >
                <Upload className="h-10 w-10 mb-2" />
                <span>Click to upload a photo</span>
                <span className="text-sm">PNG, JPG, or WEBP (Max 2MB)</span>
              </button>
            )}
          </div>
          <Button onClick={handleGenerate} disabled={isButtonDisabled} className="w-full font-semibold" size="lg">
            {isGenerating ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Ad'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

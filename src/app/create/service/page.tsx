'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateServiceAdAction } from '@/lib/actions';
import { Loader2, Wand2, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import Image from 'next/image';
import { processImage } from '@/lib/image-utils';

export default function GenerateServiceAd() {
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'Image too large',
          description: 'Please select an image smaller than 10MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setIsProcessingImage(true);
      try {
        const processedImage = await processImage(file);
        setImagePreview(processedImage);
      } catch (error) {
        console.error("Image processing failed:", error);
        toast({
            title: 'Image Processing Failed',
            description: 'Could not process the selected image. Please try another one.',
            variant: 'destructive',
        });
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

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
      const result = await generateServiceAdAction({
        description: description,
        photoDataUri: imagePreview ?? undefined,
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      sessionStorage.setItem('generatedAd_new', JSON.stringify({
        id: newAdId,
        title: result.title,
        content: result.adText,
        type: 'service',
        images: imagePreview ? [imagePreview] : []
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

  const isButtonDisabled = isGenerating || !description.trim() || isProcessingImage || isUserLoading;
  const isUploaderDisabled = isGenerating || isProcessingImage || isUserLoading;

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Generate an Ad for a Service</CardTitle>
          <CardDescription>Describe the service you offer. You can also upload a reference photo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label>Reference Image (Optional)</Label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploaderDisabled}
            />
            {imagePreview ? (
              <div className="relative group">
                <Image
                  src={imagePreview}
                  alt="Service preview"
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
                disabled={isUploaderDisabled}
                className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessingImage ? (
                    <>
                        <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                        <span>Processing Image...</span>
                    </>
                ) : (
                    <>
                        <Upload className="h-8 w-8 mb-2" />
                        <span>Click to upload a photo</span>
                        <span className="text-sm">PNG, JPG, or WEBP (Max 10MB)</span>
                    </>
                )}
              </button>
            )}
          </div>

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
              Be as specific as you like. Include your skills, experience, and service area.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={isButtonDisabled} className="w-full font-semibold" size="lg">
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

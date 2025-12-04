'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateWantedAdAction } from '@/lib/actions';
import { Loader2, Wand2, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import Image from 'next/image';
import { processImage } from '@/lib/image-utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function GenerateWantedAd() {
  const [description, setDescription] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (imagePreviews.length + files.length > 10) {
        toast({
          title: 'Too many images',
          description: 'You can upload a maximum of 10 images.',
          variant: 'destructive',
        });
        return;
      }
      
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

        const newImages = (await Promise.all(imagePromises)).filter((img): img is string => img !== null);
        setImagePreviews(prev => [...prev, ...newImages]);
      } catch (error) {
        console.error("Image processing failed:", error);
        toast({
            title: 'Image Processing Failed',
            description: 'Could not process the selected image(s). Please try again.',
            variant: 'destructive',
        });
      } finally {
        setIsProcessingImage(false);
        if(fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(previews => previews.filter((_, i) => i !== index));
  }

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: 'Description is empty',
        description: 'Please describe the item or vehicle you are looking for.',
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
      const result = await generateWantedAdAction({
        description,
        photoDataUris: imagePreviews.length > 0 ? imagePreviews : undefined,
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      sessionStorage.setItem('generatedAd_new', JSON.stringify({
        id: newAdId,
        title: result.title,
        content: result.adText,
        type: 'wanted',
        images: imagePreviews
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
  const isUploaderDisabled = isGenerating || isProcessingImage || isUserLoading || imagePreviews.length >= 10;

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Generate a 'Wanted' Ad</CardTitle>
          <CardDescription>Describe what you're looking for. You can also upload reference photos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-2">
              <Label>Reference Images (Optional)</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploaderDisabled}
              />
              {imagePreviews.length > 0 ? (
                <Carousel className="w-full">
                    <CarouselContent>
                        {imagePreviews.map((src, index) => (
                            <CarouselItem key={index} className="basis-1/2">
                                <div className="relative group aspect-video">
                                    <Image
                                        src={src}
                                        alt={`Wanted item preview ${index + 1}`}
                                        fill
                                        className="rounded-lg object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(index)}
                                        disabled={isGenerating}
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
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploaderDisabled}
                  className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessingImage ? (
                      <>
                          <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                          <span>Processing Images...</span>
                      </>
                  ) : (
                      <>
                          <Upload className="h-8 w-8 mb-2" />
                          <span>Click to upload photos</span>
                          <span className="text-sm">PNG, JPG, or WEBP (Up to 10 images)</span>
                      </>
                  )}
                </button>
              )}
               {imagePreviews.length > 0 && (
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploaderDisabled} variant="outline" className="w-full mt-2">
                    <Upload className="mr-2 h-4 w-4" />
                    Add More Photos ({imagePreviews.length}/10)
                </Button>
             )}
            </div>


          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 'Looking for a reliable, fuel-efficient sedan, 2018 or newer, under 80,000 miles. Preferably a Toyota Camry or Honda Accord. Must have a clean title and service history.'"
              className="min-h-[150px] text-base"
              disabled={isGenerating}
            />
             <p className="text-sm text-muted-foreground">
              Be as specific as you like. Include make, model, year, condition, and your budget.
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

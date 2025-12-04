
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateRealEstateAdAction } from '@/lib/actions';
import { Loader2, Wand2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { processImage } from '@/lib/image-utils';
import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function GenerateRealEstateAdPage() {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isLoading: isUploading } = useFirebaseStorage();

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

  const handleGenerate = async () => {
    if (imagePreviews.length === 0) {
      toast({
        title: 'No images selected',
        description: 'Please select one or more images to generate an ad.',
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
      // 1. Upload images to Firebase Storage
      toast({ title: 'Uploading images...', description: 'Please wait while we upload your property photos.' });
      const imageUrls = await Promise.all(
        imagePreviews.map(dataUrl => uploadImage(dataUrl, `users/${user.uid}/ads/${newAdId}`))
      );
      toast({ title: 'Upload complete!', description: 'Your images have been stored securely.' });

      // 2. Generate ad using the storage URLs
      toast({ title: 'Generating your ad...', description: 'Our AI is crafting the perfect description for your property.' });
      const result = await generateRealEstateAdAction({
        photoUrls: imageUrls
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // 3. Pass data to the editor page
      sessionStorage.setItem('generatedAd_new', JSON.stringify({
        id: newAdId,
        title: result.title,
        content: result.adText,
        type: 'real-estate',
        images: imageUrls,
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
  
  const removeImage = (index: number) => {
    setImagePreviews(previews => previews.filter((_, i) => i !== index));
  }

  const isButtonDisabled = isGenerating || imagePreviews.length === 0 || isProcessingImage || isUploading;
  const isUploaderDisabled = isGenerating || isProcessingImage || isUserLoading || isUploading || imagePreviews.length >= 10;

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Generate a Real Estate Ad</CardTitle>
          <CardDescription>Upload photos of the property. Images will be stored in Firebase Storage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
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
                                        alt={`Property preview ${index + 1}`}
                                        fill
                                        className="rounded-lg object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(index)}
                                        disabled={isGenerating || isUploading}
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
                className="w-full h-64 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessingImage || isUploading ? (
                    <>
                        <Loader2 className="h-10 w-10 mb-2 animate-spin" />
                        <span>{isUploading ? 'Uploading to Storage...' : 'Processing Images...'}</span>
                    </>
                ) : (
                    <>
                        <Upload className="h-10 w-10 mb-2" />
                        <span>Click to upload photos</span>
                        <span className="text-sm">PNG, JPG, or WEBP (Up to 10 images)</span>
                    </>
                )}
              </button>
            )}
            {imagePreviews.length > 0 && (
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploaderDisabled} variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Add More Photos ({imagePreviews.length}/10)
                </Button>
             )}
          </div>
          <Button onClick={handleGenerate} disabled={isButtonDisabled} className="w-full font-semibold" size="lg">
            {isGenerating || isUploading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {isGenerating || isUploading ? (isUploading ? 'Uploading...' : 'Generating...') : 'Generate Ad'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

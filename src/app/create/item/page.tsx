
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateItemAdFromImageAction } from '@/lib/actions';
import { Loader2, Wand2, Upload, X, Camera, Package } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { processImage } from '@/lib/image-utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CameraCapture } from '@/components/camera/camera-capture';


export default function GenerateItemAdPage() {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addImageToPreviews = (imageDataUri: string) => {
    if (imagePreviews.length >= 10) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 10 images.',
        variant: 'destructive',
      });
      return;
    }
    setImagePreviews(prev => [...prev, imageDataUri]);
  };

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
      const result = await generateItemAdFromImageAction({
        photoDataUris: imagePreviews,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      sessionStorage.setItem('generatedAd_new', JSON.stringify({
        id: newAdId,
        title: result.title,
        content: result.adText,
        type: 'item',
        images: imagePreviews,
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

  const isButtonDisabled = isGenerating || imagePreviews.length === 0 || isProcessingImage;
  const isUploaderDisabled = isGenerating || isProcessingImage || isUserLoading || imagePreviews.length >= 10;

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Generate an 'Item for Sale' Ad</CardTitle>
          <CardDescription>Upload pictures of your item, or use your camera to take one. Images will be saved when you finalize the ad.</CardDescription>
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
                                        alt={`Item preview ${index + 1}`}
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
                <div className="w-full h-64 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                    {isProcessingImage ? (
                        <>
                            <Loader2 className="h-10 w-10 mb-2 animate-spin" />
                            <span>Processing Images...</span>
                        </>
                    ) : (
                        <>
                            <Package className="h-12 w-12 mb-2" />
                            <p className="font-semibold mb-2">Add photos of your item</p>
                            <div className="flex gap-2">
                                <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploaderDisabled}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload
                                </Button>
                                <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" disabled={isUploaderDisabled}>
                                            <Camera className="mr-2 h-4 w-4" />
                                            Use Camera
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                        <CameraCapture 
                                            onCapture={(dataUri) => {
                                                addImageToPreviews(dataUri);
                                                setIsCameraOpen(false);
                                            }}
                                            onClose={() => setIsCameraOpen(false)}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <span className="text-xs mt-4">Up to 10 images (PNG, JPG, WEBP)</span>
                        </>
                    )}
                </div>
            )}
            {imagePreviews.length > 0 && (
                <div className="flex gap-2">
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploaderDisabled} variant="outline" className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Add More ({imagePreviews.length}/10)
                    </Button>
                     <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full" disabled={isUploaderDisabled}>
                                <Camera className="mr-2 h-4 w-4" />
                                Use Camera
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <CameraCapture 
                                onCapture={(dataUri) => {
                                    addImageToPreviews(dataUri);
                                    setIsCameraOpen(false);
                                }}
                                onClose={() => setIsCameraOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
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
    

    
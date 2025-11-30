
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseStorage } from '@/hooks/use-firebase-storage';
import { generateAdFromImageAction } from '@/lib/actions';
import { Loader2, Wand2, Upload, X, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/firebase';

export default function GenerateSaleAdPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { uploadImage } = useFirebaseStorage();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
        toast({
            title: 'Authentication Required',
            description: 'You must be logged in to upload an image.',
            variant: 'destructive',
        });
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      uploadImmediately(result);
    };
    reader.readAsDataURL(file);
  };
  
  const uploadImmediately = async (dataUri: string) => {
    setIsUploading(true);
    setUploadedImageUrl(null);
    console.log("Starting immediate image upload...");

    try {
        const newAdId = uuidv4(); // Generate a temporary ID for the image name
        const imageUrl = await uploadImage(dataUri, newAdId);
        setUploadedImageUrl(imageUrl);
        console.log("Image upload successful. URL:", imageUrl);
        toast({
            title: 'Upload Complete',
            description: 'Your image has been successfully uploaded to storage.',
        });
    } catch (error) {
        console.error('Immediate image upload failed:', error);
        toast({
            title: 'Upload Failed',
            description: 'Could not upload image. Please try again.',
            variant: 'destructive',
        });
        clearImage(); // Clear preview on failure
    } finally {
        setIsUploading(false);
    }
  }


  const handleGenerate = async () => {
    if (!imagePreview || !uploadedImageUrl) {
      toast({
        title: 'Image not ready',
        description: 'Please wait for the image to upload or select an image.',
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
      return;
    }

    setIsGenerating(true);
    const newAdId = uuidv4();

    try {
      // The image is already uploaded. We use the preview for AI analysis
      // and the uploaded URL for saving.
      const result = await generateAdFromImageAction({
        photoDataUri: imagePreview,
        adType: 'sell',
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      sessionStorage.setItem('generatedAd_new', JSON.stringify({
        id: newAdId,
        title: result.title,
        content: result.adText,
        type: 'sale',
        images: [uploadedImageUrl], // Pass the final Storage URL
      }));
      router.push(`/edit/${newAdId}`);

    } catch (error) {
        console.error('An error occurred during ad generation:', error);
        toast({
            title: 'Generation Failed',
            description: (error as Error).message || 'Could not generate ad. Please try again.',
            variant: 'destructive',
        });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const clearImage = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
    setIsUploading(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const isButtonDisabled = isGenerating || isUploading || !imagePreview || !uploadedImageUrl;

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Generate a 'For Sale' Ad from a Photo</CardTitle>
          <CardDescription>Upload a picture of your vehicle. The image will be stored, and our AI will write a professional ad for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading || isGenerating}
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
                    disabled={isUploading || isGenerating}
                >
                    <X className="h-4 w-4" />
                </Button>
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                        <p className="text-white mt-2">Uploading...</p>
                    </div>
                )}
                {uploadedImageUrl && !isUploading && (
                     <div className="absolute top-2 left-2 bg-green-500/80 text-white text-xs font-bold py-1 px-2 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Uploaded</span>
                    </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isGenerating}
                className="w-full h-64 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary transition-colors"
              >
                <Upload className="h-10 w-10 mb-2" />
                <span>Click to upload a photo</span>
                <span className="text-sm">PNG, JPG, or WEBP</span>
              </button>
            )}
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

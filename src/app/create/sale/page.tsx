'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateAdFromImageAction } from '@/lib/actions';
import { Loader2, UploadCloud, Wand2, X } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function GenerateForSaleAd() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleGenerate = async () => {
    if (!file || !previewUrl) {
      toast({
        title: 'No image selected',
        description: 'Please upload an image of your vehicle.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAdFromImageAction({
        photoDataUri: previewUrl,
        adType: 'sell',
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      sessionStorage.setItem('generatedAd_new', JSON.stringify({
        title: `For Sale: ${file.name.split('.')[0]}`,
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

  const clearImage = () => {
    setFile(null);
    setPreviewUrl(null);
    // Reset the input value
    const input = document.getElementById('file-upload') as HTMLInputElement;
    if(input) input.value = '';
  }
  
  const uploadPlaceholder = PlaceHolderImages.find(p => p.id === 'upload-placeholder');

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Generate a 'For Sale' Ad</CardTitle>
          <CardDescription>Upload a photo of your vehicle, and our AI will write a compelling ad for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="file-upload" className="block text-sm font-medium text-foreground">
              Vehicle Photo
            </label>
            <div className="relative mt-2 flex justify-center rounded-lg border-2 border-dashed border-border px-6 py-10 hover:border-primary transition-colors">
              {previewUrl ? (
                <div className="relative w-full">
                  <Image
                    src={previewUrl}
                    alt="Vehicle preview"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-md object-contain max-h-[400px]"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  {uploadPlaceholder && (
                    <Image
                        src={uploadPlaceholder.imageUrl}
                        width={100}
                        height={100}
                        alt="Upload placeholder"
                        data-ai-hint={uploadPlaceholder.imageHint}
                        className="mx-auto h-16 w-16 text-gray-300 opacity-50"
                    />
                  )}
                  <div className="mt-4 flex text-sm leading-6 text-foreground">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                    >
                      <span>Upload a file</span>
                      <Input id="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={isGenerating} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={!file || isGenerating} className="w-full font-semibold" size="lg">
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

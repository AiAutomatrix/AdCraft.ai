'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Loader2, VideoOff, Circle } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface CameraCaptureProps {
  onCapture: (imageDataUri: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: stop the camera stream when the component unmounts or the modal closes
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      // Draw the current video frame onto the canvas
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      // Convert canvas to a data URI
      const dataUri = canvas.toDataURL('image/webp', 0.9); // Use webp for better compression
      onCapture(dataUri);
    } else {
        toast({
            variant: 'destructive',
            title: 'Capture Failed',
            description: 'Could not get canvas context to capture image.',
        });
    }

    setIsCapturing(false);
  };

  return (
    <div className="space-y-4">
        <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Use Camera</DialogTitle>
            <DialogDescription>
                Position the subject in the frame and click "Take Photo".
            </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden flex items-center justify-center">
            {hasCameraPermission === null && (
                <div className="flex flex-col items-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Requesting camera access...</p>
                </div>
            )}

            {hasCameraPermission === false && (
                <Alert variant="destructive" className="w-auto">
                    <VideoOff className="h-4 w-4"/>
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser to use this feature.
                    </AlertDescription>
                </Alert>
            )}
            
            <video
                ref={videoRef}
                className={hasCameraPermission ? 'w-full h-full object-cover' : 'hidden'}
                autoPlay
                playsInline
                muted
            />

            {/* Hidden canvas for capturing the image */}
            <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-center gap-4">
            <Button
                type="button"
                size="lg"
                onClick={handleCapture}
                disabled={!hasCameraPermission || isCapturing}
                className="rounded-full w-20 h-20"
            >
                {isCapturing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                    <Circle className="h-10 w-10 text-destructive-foreground fill-current" />
                )}
                <span className="sr-only">Take Photo</span>
            </Button>
        </div>
    </div>
  );
}
    
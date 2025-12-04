
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Loader2, VideoOff, Circle } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (imageDataUri: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [focusIndicator, setFocusIndicator] = useState<{ x: number; y: number; id: number } | null>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const track = stream.getVideoTracks()[0];
        setVideoTrack(track);
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
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleFocus = async (event: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current || !videoTrack) return;

    const video = videoRef.current;
    const rect = video.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Show focus indicator
    setFocusIndicator({ x, y, id: Date.now() });
    setTimeout(() => setFocusIndicator(null), 1000); // Hide after 1 second

    // Check if tap-to-focus is supported
    const capabilities = videoTrack.getCapabilities();
    // @ts-ignore - focusMode is not in all TS libs yet
    if (!capabilities.focusMode || !capabilities.focusMode.includes('manual')) {
      return;
    }
    
    // Normalize coordinates to 0-1 range
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    try {
        // @ts-ignore
      await videoTrack.applyConstraints({
        advanced: [{ focusMode: 'manual', focusDistance: 0.1, pointsOfInterest: [{x: normalizedX, y: normalizedY}] }]
      });
    } catch (error) {
      console.warn("Tap to focus failed:", error);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUri = canvas.toDataURL('image/webp', 0.9);
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
                Tap the video to focus, then press the button to take a photo.
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
                className={cn('w-full h-full object-cover', !hasCameraPermission && 'hidden')}
                autoPlay
                playsInline
                muted
                onClick={handleFocus}
            />

            {focusIndicator && (
                <div 
                    key={focusIndicator.id}
                    className="absolute w-16 h-16 border-2 border-white rounded-full animate-ping"
                    style={{ left: `${focusIndicator.x - 32}px`, top: `${focusIndicator.y - 32}px` }}
                />
            )}

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
    

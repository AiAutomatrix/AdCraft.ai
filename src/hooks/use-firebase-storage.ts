'use client';

import { useState } from 'react';
import {
  ref,
  uploadString,
  getDownloadURL,
  StorageReference,
} from 'firebase/storage';
import { useFirebase } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';

export function useFirebaseStorage() {
  const { storage } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  /**
   * Uploads an image to Firebase Storage.
   * @param dataUrl The image file as a base64 data URI.
   * @param path The path in the storage bucket where the image will be stored (e.g., 'ads/images').
   * @returns A promise that resolves with the public download URL of the uploaded image.
   */
  const uploadImage = async (dataUrl: string, path: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    // Create a unique filename for the image
    const fileName = `${uuidv4()}.webp`;
    const storageRef: StorageReference = ref(storage, `${path}/${fileName}`);

    try {
      // The 'data_url' string indicates we're uploading a base64 string.
      const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
      
      // The upload is complete, now get the public URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setUploadProgress(100);
      setIsLoading(false);
      
      return downloadURL;

    } catch (e: any) {
      console.error('Firebase Storage upload failed:', e);
      setError(e);
      setIsLoading(false);
      throw e;
    }
  };

  return {
    uploadImage,
    isLoading,
    error,
    uploadProgress,
  };
}

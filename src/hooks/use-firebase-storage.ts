'use client';

import { useState, useCallback } from 'react';
import { useAuth, useStorage, useUser } from '@/firebase';
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export function useFirebaseStorage() {
  const storage = useStorage();
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to upload a single image (as data URL)
  const uploadImage = useCallback(
    async (dataUrl: string): Promise<string> => {
      if (!user || !storage) {
        throw new Error('User not authenticated or Storage not available.');
      }
      
      setIsUploading(true);
      setError(null);
      
      try {
        const fileExtension = dataUrl.substring(dataUrl.indexOf('/') + 1, dataUrl.indexOf(';'));
        const fileName = `${uuidv4()}.${fileExtension}`;
        const storageRef = ref(storage, `users/${user.uid}/ad_images/${fileName}`);

        const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        setIsUploading(false);
        return downloadURL;

      } catch (e: any) {
        setError(e);
        setIsUploading(false);
        console.error("Image upload failed: ", e);
        throw e;
      }
    },
    [storage, user]
  );
  
  // Function to upload multiple images
  const uploadImages = useCallback(
    async (imageUris: string[]): Promise<string[]> => {
      const finalUrls: string[] = [];
      if (!user || !storage) return imageUris; // Return original URIs if not logged in

      for (const uri of imageUris) {
        // If it's a data URI, upload it. If it's already a URL, keep it.
        if (uri.startsWith('data:')) {
          try {
            const url = await uploadImage(uri);
            finalUrls.push(url);
          } catch (error) {
            console.error(`Failed to upload one of the images:`, error);
            // Optionally, you could decide to keep the data URI as a fallback
            // For now, we just skip it if upload fails.
          }
        } else {
          // It's already a URL, just add it to the list
          finalUrls.push(uri);
        }
      }
      return finalUrls;
    },
    [user, storage, uploadImage]
  );


  // Function to delete an image from a Firebase Storage URL
  const deleteImage = useCallback(
    async (imageUrl: string) => {
      if (!storage) {
        throw new Error('Storage not available.');
      }
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (e: any) {
        // It's okay if the image doesn't exist (e.g., already deleted)
        if (e.code !== 'storage/object-not-found') {
          console.error(`Error deleting image ${imageUrl}:`, e);
          throw e;
        }
      }
    },
    [storage]
  );

  return { isUploading, error, uploadImages, deleteImage };
}

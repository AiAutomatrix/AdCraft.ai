'use client';

import { useMemo } from 'react';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { useFirebaseApp, useUser } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';

export function useFirebaseStorage() {
  const firebaseApp = useFirebaseApp();
  const storage = useMemo(() => getStorage(firebaseApp), [firebaseApp]);
  const { user } = useUser();

  const uploadImages = async (imageUris: string[]): Promise<string[]> => {
    if (!user) throw new Error('User must be logged in to upload images.');
    
    const uploadPromises = imageUris.map(async (uri) => {
      // If the uri is already a Firebase Storage URL, don't re-upload it.
      if (uri.startsWith('https://firebasestorage.googleapis.com')) {
        return uri;
      }
      
      // Assumes URI is a data URI (e.g., from a file input)
      if (uri.startsWith('data:image')) {
        const fileExtension = uri.substring(uri.indexOf('/') + 1, uri.indexOf(';'));
        const imageId = uuidv4();
        const storageRef = ref(storage, `users/${user.uid}/images/${imageId}.${fileExtension}`);
        
        await uploadString(storageRef, uri, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
      }
      
      // If it's not a storage URL or a data URI, return it as is (might be a placeholder)
      return uri;
    });
    
    return Promise.all(uploadPromises);
  };
  
  const deleteImage = async (imageUrl: string) => {
    if (!imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
      // Don't try to delete non-storage images (like placeholders)
      return;
    }
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  };

  return { uploadImages, deleteImage, storage };
}

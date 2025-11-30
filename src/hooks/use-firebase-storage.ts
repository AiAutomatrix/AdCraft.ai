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

export function useFirebaseStorage() {
  const firebaseApp = useFirebaseApp();
  const storage = useMemo(() => getStorage(firebaseApp), [firebaseApp]);
  const { user } = useUser();

  /**
   * Uploads a single image data URI to Firebase Storage.
   * @param imageUri The data URI of the image to upload.
   * @param imageId The unique ID to use for the stored image file.
   * @returns The public download URL of the uploaded image.
   */
  const uploadImage = async (imageUri: string, imageId: string): Promise<string> => {
    if (!user) {
      const authError = new Error('User must be logged in to upload images.');
      console.error('Authentication error in uploadImage:', authError);
      throw authError;
    }
    
    if (!imageUri.startsWith('data:image')) {
        const formatError = new Error('Invalid image data URI format.');
        console.error('Data URI error in uploadImage:', formatError);
        throw formatError;
    }
      
    try {
      const fileExtension = imageUri.substring(imageUri.indexOf('/') + 1, imageUri.indexOf(';base64'));
      const storageRef = ref(storage, `image/${imageId}.${fileExtension}`);
      
      await uploadString(storageRef, imageUri, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Firebase Storage Error: Failed to upload image.", error);
      throw error; // Re-throw the error to be caught by the calling function
    }
  };
  
  /**
   * Deletes an image from Firebase Storage using its ID.
   * It tries to delete common image formats (.png, .jpg, .jpeg, .webp).
   * @param imageId The unique ID of the image to delete.
   */
  const deleteImage = async (imageId: string) => {
    if (!user) throw new Error('User must be logged in to delete an image.');

    const extensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
    let deleted = false;

    for (const ext of extensions) {
        try {
            const storageRef = ref(storage, `image/${imageId}.${ext}`);
            await getDownloadURL(storageRef); // Check if file exists before trying to delete
            await deleteObject(storageRef);
            deleted = true;
            break; // Exit loop once deleted
        } catch (error: any) {
            if (error.code !== 'storage/object-not-found') {
               console.error(`Failed to delete image ${imageId}.${ext}:`, error);
            }
        }
    }
    if(!deleted) {
        console.warn(`Image with ID ${imageId} not found in storage with any common extension.`);
    }
  };

  return { uploadImage, deleteImage, storage };
}

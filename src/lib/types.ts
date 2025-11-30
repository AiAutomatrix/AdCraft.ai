export type Ad = {
  id: string;
  userId?: string;
  title: string;
  content: string;
  type: 'sale' | 'wanted';
  images?: string[]; // Array of image URLs
  createdAt: any;
  updatedAt?: any;
};

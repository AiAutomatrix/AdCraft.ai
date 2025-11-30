export type Ad = {
  id: string;
  userId?: string;
  title: string;
  content: string;
  type: 'sale' | 'wanted';
  createdAt: any;
  updatedAt?: any;
  images?: string[];
};

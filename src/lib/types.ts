export type Ad = {
  id: string;
  userId?: string;
  title: string;
  content: string;
  type: 'sale' | 'wanted' | 'item' | 'service';
  images?: string[];
  createdAt: any;
  updatedAt?: any;
};

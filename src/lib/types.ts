import type { Timestamp } from 'firebase/firestore';

export type Ad = {
  id: string;
  userId?: string;
  title: string;
  content: string;
  type: 'sale' | 'wanted';
  createdAt: string | Timestamp;
  images?: string[];
};

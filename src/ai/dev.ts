import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-ad-improvements.ts';
import '@/ai/flows/generate-sale-ad-from-text.ts';
import '@/ai/flows/generate-wanted-ad.ts';
import '@/ai/flows/generate-item-ad-from-image.ts';
import '@/ai/flows/generate-service-ad-from-text.ts';

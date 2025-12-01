'use server';
/**
 * @fileOverview This file defines the Genkit flows for the AdCraft AI application.
 *
 * - generateAdFromImage: Generates a vehicle ad from an image.
 * - generateItemAdFromImage: Generates an item ad from an image.
 * - generateSaleAdFromText: Generates a vehicle sale ad from text.
 * - generateServiceAd: Generates a service ad from text and an optional image.
 * - generateWantedAd: Generates a wanted ad from text and an optional image.
 * - suggestAdImprovements: Suggests improvements for existing ad copy.
 */
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-ad-improvements.ts';
import '@/ai/flows/generate-sale-ad-from-text.ts';
import '@/ai/flows/generate-wanted-ad.ts';
import '@/ai/flows/generate-item-ad-from-image.ts';
import '@/ai/flows/generate-service-ad.ts';
import '@/ai/flows/text-to-speech.ts';

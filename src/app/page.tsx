'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, FilePlus2, FolderKanban, Wand2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const features = [
    {
      icon: <FilePlus2 className="h-8 w-8 text-primary" />,
      title: 'Effortless Ad Creation',
      description: 'Choose to generate a "For Sale" or a "Wanted" ad with a single click.',
    },
    {
      icon: <Wand2 className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Content',
      description: 'Our AI analyzes your input to write persuasive and effective ad copy instantly.',
    },
    {
      icon: <FolderKanban className="h-8 w-8 text-primary" />,
      title: 'Save & Manage',
      description: 'Keep all your generated ads in one place. Edit, copy, or delete them as needed.',
    },
  ];
  
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-car') || PlaceHolderImages[0];

  return (
    <div className="flex flex-1 flex-col">
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full pt-24 pb-16 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32 relative overflow-hidden grain-bg"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-surface-1 to-background"></div>
        <div className="container max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
                  Craft the Perfect Vehicle Ad with AI
                </h1>
                <p className="max-w-[600px] text-text-secondary md:text-xl">
                  Whether you're selling your car or searching for a new one, AdCraft AI generates compelling ads from a simple photo or description.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Button asChild size="lg" className="font-semibold py-3 px-6 text-base">
                  <Link href="/create">
                    Create New Ad <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="font-semibold py-3 px-6 text-base">
                  <Link href="/saved">My Saved Ads</Link>
                </Button>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <Image
                src={heroImage.imageUrl}
                width="600"
                height="400"
                alt="Hero Vehicle"
                data-ai-hint={heroImage.imageHint}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last shadow-2xl shadow-primary/10"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="w-full py-16 md:py-24 lg:py-32 bg-background"
      >
        <div className="container max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-surface-2 px-3 py-1 text-sm font-medium text-secondary">Key Features</div>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-5xl">
                Everything You Need to Get Noticed
              </h2>
              <p className="max-w-[900px] text-text-secondary md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From AI analysis to easy editing, our tools are designed to make your vehicle ads stand out from the crowd.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-sm gap-8 sm:max-w-none sm:grid-cols-2 md:gap-10 lg:grid-cols-3 mt-16">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="glass-card flex flex-col p-8"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-headline text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

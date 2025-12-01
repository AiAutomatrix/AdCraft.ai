'use client';

import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Eye, FolderKanban, Wand2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";


export default function Home() {
  const features = [
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      title: 'Powerful AI Vision Analysis',
      description: 'Upload a photo and our AI Vision will instantly identify your vehicle or item, analyzing its features to generate a detailed and accurate ad.',
    },
    {
      icon: <Wand2 className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Content',
      description: 'Our AI writes persuasive and effective ad copy instantly, tailored to whether you are selling, buying, or offering a service.',
    },
    {
      icon: <FolderKanban className="h-8 w-8 text-primary" />,
      title: 'Save & Share Anywhere',
      description: 'Keep all your ads in one place. Edit, copy, and share them across multiple platforms with a single click.',
    },
  ];
  
  const heroSlides = [
    {
      id: 'sell-vehicle',
      title: 'Turn a Photo into a Polished Ad with AI Vision',
      description: "Upload an image of your car and let our AI Vision analyze it. We'll identify the make, model, and features to write a compelling ad for you.",
      image: PlaceHolderImages.find(p => p.id === 'hero-car-sell')
    },
    {
      id: 'find-vehicle',
      title: 'Find Your Next Dream Car Faster',
      description: "Describe the vehicle you're looking for, and let our AI write a clear, concise 'wanted' ad to attract sellers.",
      image: PlaceHolderImages.find(p => p.id === 'hero-car-wanted')
    },
    {
      id: 'sell-item',
      title: 'Sell Anything with an AI-Generated Ad',
      description: "Use our AI Vision to analyze a photo of any item. From furniture to electronics, get a high-quality sales ad in seconds.",
      image: PlaceHolderImages.find(p => p.id === 'hero-item-sell')
    },
    {
      id: 'offer-service',
      title: 'Offer Your Professional Services',
      description: "Describe your professional services and let our AI create an engaging ad to attract new clients.",
      image: PlaceHolderImages.find(p => p.id === 'hero-service-offer')
    }
  ].filter(slide => slide.image); // Filter out slides if image is not found

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
        <Carousel
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            className="w-full"
          >
            <CarouselContent>
              {heroSlides.map((slide) => (
                <CarouselItem key={slide.id}>
                  <div className="grid gap-8 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                    <div className="flex flex-col justify-center space-y-6">
                      <div className="space-y-4">
                        <motion.h1
                          key={`${slide.id}-title`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none"
                        >
                          {slide.title}
                        </motion.h1>
                        <motion.p
                          key={`${slide.id}-desc`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                          className="max-w-[600px] text-text-secondary md:text-xl"
                        >
                          {slide.description}
                        </motion.p>
                      </div>
                      <motion.div
                        key={`${slide.id}-buttons`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                        className="flex flex-col gap-3 min-[400px]:flex-row"
                      >
                        <Button asChild size="lg" className="font-semibold py-3 px-6 text-base">
                          <Link href="/create">
                            Create New Ad <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                        <Button asChild size="lg" variant="secondary" className="font-semibold py-3 px-6 text-base">
                          <Link href="/saved">My Saved Ads</Link>
                        </Button>
                      </motion.div>
                    </div>
                    <motion.div
                      key={`${slide.id}-image`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                      className="relative"
                    >
                      {slide.image && (
                        <Image
                          src={slide.image.imageUrl}
                          width="600"
                          height="400"
                          alt={slide.image.description}
                          data-ai-hint={slide.image.imageHint}
                          className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last shadow-2xl shadow-primary/10"
                          priority={heroSlides.indexOf(slide) === 0}
                        />
                      )}
                    </motion.div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-[-1rem] text-foreground" />
            <CarouselNext className="right-[-1rem] text-foreground" />
          </Carousel>

        </div>
      </motion.section>
      
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
                Our core is AI vision analysis. We identify items in your photos to create superior ads, which you can then save, edit, and share anywhere.
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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, FilePlus2, FolderKanban, Wand2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

  return (
    <div className="flex flex-1 flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Craft the Perfect Vehicle Ad with AI
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Whether you're selling your car or searching for a new one, AdCraft AI generates compelling ads from a simple photo or description.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="font-semibold">
                  <Link href="/create">
                    Create New Ad <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="font-semibold">
                  <Link href="/saved">My Saved Ads</Link>
                </Button>
              </div>
            </div>
            <Image
              src={PlaceHolderImages[0].imageUrl}
              width="600"
              height="400"
              alt="Hero Vehicle"
              data-ai-hint={PlaceHolderImages[0].imageHint}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
            />
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                Everything You Need to Get Noticed
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From AI analysis to easy editing, our tools are designed to make your vehicle ads stand out from the crowd.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                  {feature.icon}
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';

export default function CreateAdPage() {
  const options = [
    {
      href: '/create/wanted',
      title: 'I am looking for a vehicle',
      description: 'Generate a "wanted" ad by describing the vehicle you need.',
      icon: <Search className="h-10 w-10 text-primary mb-4" />,
    },
  ];

  return (
    <div className="container max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Create a New Ad
        </h1>
        <p className="mx-auto mt-4 max-w-[700px] text-text-secondary md:text-xl leading-relaxed">
          Describe the vehicle you're looking for to get started.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-lg gap-8">
        {options.map((option) => (
          <Link href={option.href} key={option.href} className="group block">
            <Card className="h-full transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl bg-surface-2 border-border/50 hover:border-primary/50">
              <CardHeader className="p-8">
                {option.icon}
                <CardTitle className="font-headline text-2xl">{option.title}</CardTitle>
                <CardDescription className="text-base text-text-secondary">{option.description}</CardDescription>
                <div className="mt-4 flex items-center font-semibold text-primary">
                  Get Started <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Car, Search } from 'lucide-react';
import Link from 'next/link';

export default function CreateAdPage() {
  const options = [
    {
      href: '/create/sale',
      title: 'I want to sell a vehicle',
      description: 'Generate an ad by uploading a photo of your vehicle.',
      icon: <Car className="h-10 w-10 text-primary mb-4" />,
    },
    {
      href: '/create/wanted',
      title: 'I am looking for a vehicle',
      description: 'Generate a "wanted" ad by describing the vehicle you need.',
      icon: <Search className="h-10 w-10 text-primary mb-4" />,
    },
  ];

  return (
    <div className="container py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">
          Create a New Ad
        </h1>
        <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
          What are you looking to do today? Choose an option below to get started.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
        {options.map((option) => (
          <Link href={option.href} key={option.href} className="group block">
            <Card className="h-full transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
              <CardHeader className="p-8">
                {option.icon}
                <CardTitle className="font-headline text-2xl">{option.title}</CardTitle>
                <CardDescription className="text-base">{option.description}</CardDescription>
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

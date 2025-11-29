import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function PremiumPage() {
  const features = [
    'Unlimited ad generations',
    'Advanced AI analysis reports',
    'Exclusive ad templates & styles',
    'Enhanced ad visibility options',
    'Priority support',
    'Access to market trend data',
  ];

  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center space-y-4">
        <div className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-primary font-semibold">
          <Sparkles className="inline-block mr-2 h-5 w-5" />
          Go Premium
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-6xl">
          Unlock the Full Power of AdCraft AI
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl">
          Supercharge your ad creation process with our premium features, designed for serious sellers and dealerships.
        </p>
      </div>

      <Card className="mt-12 shadow-2xl bg-gradient-to-br from-card to-secondary/30">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Premium Plan</CardTitle>
          <p className="text-5xl font-bold mt-2">$19<span className="text-lg font-normal text-muted-foreground">/month</span></p>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          <Button size="lg" className="w-full font-bold text-lg">
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
      
      <p className="text-center mt-4 text-sm text-muted-foreground">
        This is a demo feature. The button is not functional.
      </p>
    </div>
  );
}

import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'AdCraft AI - AI Vision Ad Generator for Vehicles & Items',
  description: 'Use AI Vision to analyze images of your vehicle or item and instantly generate compelling ads. Save and share across any platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          'antialiased font-body',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <FirebaseClientProvider>
          <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

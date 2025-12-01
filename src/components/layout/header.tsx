'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, Menu, Sparkles } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '../icons';
import { AuthButton } from './auth-button';

const navLinks = [
  { href: '/create', label: 'Create Ad' },
  { href: '/saved', label: 'Saved Ads' },
  { href: '/premium', label: 'Go Premium' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };
  
  const isEditPage = pathname.startsWith('/edit/');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {isEditPage ? (
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 md:hidden">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
        ): (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                    <SheetHeader className="text-left">
                    <SheetTitle>
                        <Link href="/" onClick={handleLinkClick} className="flex items-center space-x-2">
                            <Logo className="h-6 w-6 text-primary" />
                            <span className="font-bold font-headline">
                            AdCraft AI
                            </span>
                        </Link>
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Main application navigation links.
                    </SheetDescription>
                    </SheetHeader>
                    
                    <div className="flex flex-col space-y-3 pt-6">
                        {navLinks.map((link) => (
                            <Link
                                key={`mobile-${link.href}`}
                                href={link.href}
                                onClick={handleLinkClick}
                                className={cn(
                                    'text-lg transition-colors hover:text-foreground/80',
                                    pathname === link.href
                                    ? 'text-foreground'
                                    : 'text-foreground/60',
                                    link.href === '/premium' && 'text-accent hover:text-accent/80'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        )}
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-start">
            <div className="mr-4 hidden md:flex">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Logo className="h-6 w-6 text-primary" />
                <span className="hidden font-bold sm:inline-block font-headline">
                  AdCraft AI
                </span>
              </Link>
              <nav className="flex items-center gap-6 text-sm">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'transition-colors hover:text-foreground/80',
                      pathname === link.href
                        ? 'text-foreground'
                        : 'text-foreground/60',
                      link.href === '/premium' && 'text-accent hover:text-accent/80'
                    )}
                  >
                    {link.label === 'Go Premium' ? (
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4" /> {link.label}
                      </span>
                    ) : (
                      link.label
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add a search bar here later */}
          </div>
          <nav className="flex items-center justify-end md:flex-1">
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  );
}

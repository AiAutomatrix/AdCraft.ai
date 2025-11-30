'use client';

import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, type Auth } from 'firebase/auth';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';

function handleSignOut(auth: Auth) {
  signOut(auth);
}

export function AuthButton() {
  const { user, loading, error } = useUser();
  const auth = useAuth();

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (error) {
    console.error('Auth error:', error);
    return (
      <Link href="/login">
        <Button variant="secondary">Login</Button>
      </Link>
    );
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button>Login</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.photoURL || undefined}
              alt={user.displayName || 'User'}
            />
            <AvatarFallback>
              {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => auth && handleSignOut(auth)}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

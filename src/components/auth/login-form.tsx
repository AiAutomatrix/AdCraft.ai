'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import EmailForm from './email-form';

function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
}

export default function LoginForm() {
  const auth = useAuth();
  const googleIcon = useMemo(
    () => PlaceHolderImages.find((p) => p.id === 'google-icon'),
    []
  );

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in or create an account to get started.
        </p>
      </div>
      {auth ? (
        <div className="grid gap-6">
          <Button
            variant="outline"
            type="button"
            onClick={() => signInWithGoogle(auth)}
          >
            {googleIcon && (
              <Image
                className="mr-2 h-4 w-4"
                src={googleIcon.imageUrl}
                width={16}
                height={16}
                alt="Google"
                data-ai-hint={googleIcon.imageHint}
              />
            )}
            Sign In with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <EmailForm />
        </div>
      ) : null}
    </div>
  );
}

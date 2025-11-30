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
          Sign in to access your saved ads and premium features.
        </p>
      </div>
      {auth ? (
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
      ) : null}
    </div>
  );
}

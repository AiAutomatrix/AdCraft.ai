'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/auth/login-form';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

function LoginPageContent() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/saved');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <div className="container relative flex h-full flex-1 items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPageContent />
      </Suspense>
    </div>
  );
}

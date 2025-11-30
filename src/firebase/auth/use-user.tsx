'use client';

import { useUser as useFirebaseUserHook } from '@/firebase/provider';
import type { User } from 'firebase/auth';

type UseUser = {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
};

export function useUser(): UseUser {
  const { user, isUserLoading, userError } = useFirebaseUserHook();
  return { user, isUserLoading, userError };
}

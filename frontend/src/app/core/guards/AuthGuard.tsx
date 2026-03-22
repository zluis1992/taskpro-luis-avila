'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  return <>{children}</>;
}

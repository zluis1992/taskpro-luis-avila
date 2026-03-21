'use client';

import { AuthGuard } from '@/app/core/guards/AuthGuard';
import { MainLayout } from '@/app/shared/layouts/MainLayout';

export default function MainRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/app/core/services/auth.service';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = authService.getCurrentUser();

  function handleLogout() {
    authService.logout();
    router.push('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#1e2a3a', color: '#fff',
        display: 'flex', flexDirection: 'column', padding: '24px 0'
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #2e3e50' }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>TaskPro</h2>
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/projects', label: 'Projects' },
            { href: '/users', label: 'Users' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              display: 'block', padding: '10px 20px',
              color: '#c5d3e0', textDecoration: 'none',
              fontSize: 14
            }}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2e3e50', fontSize: 13 }}>
          <div style={{ marginBottom: 8 }}>{user?.name}</div>
          <div style={{ color: '#8a9bb0', marginBottom: 12 }}>{user?.role}</div>
          <button onClick={handleLogout} style={{
            background: 'none', border: '1px solid #2e3e50', color: '#c5d3e0',
            padding: '6px 12px', cursor: 'pointer', borderRadius: 4, fontSize: 12
          }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: '#f5f7fa' }}>
        {children}
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TextBox from 'devextreme-react/text-box';
import Button from 'devextreme-react/button';
import { authService } from '@/app/core/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login({ email, password });
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 8, padding: 40,
      width: 380, boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>TaskPro</h1>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>Sign in to your account</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Email</label>
          <TextBox
            value={email}
            onValueChanged={(e) => setEmail(e.value)}
            placeholder="you@example.com"
            width="100%"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Password</label>
          <TextBox
            value={password}
            onValueChanged={(e) => setPassword(e.value)}
            mode="password"
            placeholder="••••••••"
            width="100%"
          />
        </div>

        {error && (
          <p style={{ color: '#e53e3e', fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}

        <Button
          text={loading ? 'Signing in...' : 'Sign In'}
          type="default"
          useSubmitBehavior
          width="100%"
          disabled={loading}
        />
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#666' }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: '#3b82f6' }}>Register</Link>
      </p>
    </div>
  );
}

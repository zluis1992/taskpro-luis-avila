'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DxForm, ButtonItem, SimpleItem } from '@/app/shared/components/dx-form';
import Toast from 'devextreme-react/toast';
import { authService } from '@/app/core/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('El formato del correo electrónico no es válido.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await authService.login({ email: trimmedEmail, password: trimmedPassword });
      router.push('/dashboard');
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="taskpro-auth-card">
      <Toast visible={!!error} message={error} type="error" displayTime={2500} onHiding={() => setError('')} />

      <div className="taskpro-auth-card-header">
        <h1>TaskPro</h1>
        <p>Bienvenido, inicia sesión para continuar</p>
      </div>

      <div className="taskpro-auth-card-body">
        <form onSubmit={handleSubmit}>
          <DxForm>
            <SimpleItem
              dataField="email"
              label={{ text: 'Correo electrónico' }}
              editorType="dxTextBox"
              editorOptions={{
                value: email,
                onValueChanged: (e: { value: string }) => setEmail(e.value),
                placeholder: 'tu@correo.com',
              }}
              isRequired
            />
            <SimpleItem
              dataField="password"
              label={{ text: 'Contraseña' }}
              editorType="dxTextBox"
              editorOptions={{
                value: password,
                onValueChanged: (e: { value: string }) => setPassword(e.value),
                mode: 'password',
              }}
              isRequired
            />
            <ButtonItem
              buttonOptions={{
                text: loading ? 'Iniciando sesión...' : 'Iniciar sesión',
                type: 'default',
                useSubmitBehavior: true,
                width: '100%',
                disabled: loading,
              }}
            />
          </DxForm>
        </form>
      </div>

      <div className="taskpro-auth-card-footer">
        ¿No tienes cuenta?
        <Link href="/register">Regístrate</Link>
      </div>
    </div>
  );
}

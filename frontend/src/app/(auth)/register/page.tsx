'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DxForm, ButtonItem, SimpleItem } from '@/app/shared/components/dx-form';
import Toast from 'devextreme-react/toast';
import { authService } from '@/app/core/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register({ name, email, password });
      await authService.login({ email, password });
      router.push('/dashboard');
    } catch {
      setError('El registro falló. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="taskpro-auth-card">
      <Toast visible={!!error} message={error} type="error" displayTime={2500} onHiding={() => setError('')} />

      <div className="taskpro-auth-card-header">
        <h1>TaskPro</h1>
        <p>Crea tu cuenta para comenzar</p>
      </div>

      <div className="taskpro-auth-card-body">
        <form onSubmit={handleSubmit}>
          <DxForm>
            <SimpleItem
              dataField="name"
              label={{ text: 'Nombre' }}
              editorType="dxTextBox"
              editorOptions={{
                value: name,
                onValueChanged: (e: { value: string }) => setName(e.value),
                placeholder: 'Tu nombre',
              }}
              isRequired
            />
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
                text: loading ? 'Creando cuenta...' : 'Crear cuenta',
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
        ¿Ya tienes cuenta?
        <Link href="/login">Inicia sesión</Link>
      </div>
    </div>
  );
}

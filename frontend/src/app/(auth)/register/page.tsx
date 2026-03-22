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
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('El formato del correo electrónico no es válido.');
      return;
    }
    if (trimmedPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await authService.register({ name: trimmedName, email: trimmedEmail, password: trimmedPassword });
      await authService.login({ email: trimmedEmail, password: trimmedPassword });
      router.push('/dashboard');
    } catch {
      setError('El registro falló. Verifique que el correo no esté en uso.');
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

'use client';

import { useCallback, useEffect, useState } from 'react';
import { confirm as dxConfirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { User } from '@/app/core/models/user.model';
import { authService } from '@/app/core/services/auth.service';
import { userService } from '@/app/core/services/user.service';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMode, setPopupMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  function handleNew() {
    setSelectedUser(null);
    setPopupMode('create');
    setName('');
    setEmail('');
    setPassword('');
    setPopupVisible(true);
  }

  async function handleCreate() {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (password.length < 6) {
      notify({ message: 'La contraseña debe tener al menos 6 caracteres.', minWidth: 280 }, 'warning', 3000);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      notify({ message: 'El formato del correo electrónico no es válido.', minWidth: 280 }, 'warning', 3000);
      return;
    }
    setSaving(true);
    try {
      await authService.register({ name: name.trim(), email: email.trim(), password: password.trim() });
      setPopupVisible(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  function handleView(user: User) {
    setSelectedUser(user);
    setPopupMode('view');
    setPopupVisible(true);
  }

  function handleEdit(user: User) {
    setSelectedUser(user);
    setPopupMode('edit');
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setPopupVisible(true);
  }

  async function handleUpdate() {
    if (!selectedUser || !name.trim() || !email.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      notify({ message: 'El formato del correo electrónico no es válido.', minWidth: 280 }, 'warning', 3000);
      return;
    }
    if (password && password.length < 6) {
      notify({ message: 'La contraseña debe tener al menos 6 caracteres.', minWidth: 280 }, 'warning', 3000);
      return;
    }
    setSaving(true);
    try {
      const request: { name: string; email: string; password?: string } = {
        name: name.trim(),
        email: email.trim(),
      };
      if (password.trim()) request.password = password.trim();
      await userService.update(selectedUser.id, request);
      setPopupVisible(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, userName: string) {
    const result = await dxConfirm(
      `¿Está seguro de que desea eliminar al usuario "<b>${userName}</b>"?`,
      'Confirmar eliminación',
    );
    if (!result) return;
    await userService.remove(id);
    setPopupVisible(false);
    await loadData();
  }

  return {
    users,
    loading,
    saving,
    popupVisible,
    popupMode,
    selectedUser,
    name,
    email,
    password,
    setName,
    setEmail,
    setPassword,
    setPopupVisible,
    handleNew,
    handleCreate,
    handleUpdate,
    handleView,
    handleEdit,
    handleDelete,
  };
}

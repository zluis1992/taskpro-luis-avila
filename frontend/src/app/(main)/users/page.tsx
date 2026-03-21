'use client';

import { useEffect, useState } from 'react';
import DataGrid, { Column, Paging, SearchPanel, Editing } from 'devextreme-react/data-grid';
import { User } from '@/app/core/models/user.model';
import { userService } from '@/app/core/services/user.service';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleDelete(id: number) {
    if (!confirm('Delete this user?')) return;
    await userService.remove(id);
    await loadUsers();
  }

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Users</h1>

      <DataGrid
        dataSource={users}
        keyExpr="id"
        showBorders
        rowAlternationEnabled
      >
        <SearchPanel visible />
        <Paging pageSize={10} />
        <Column dataField="name" caption="Name" />
        <Column dataField="email" caption="Email" />
        <Column dataField="role" caption="Role" width={100} />
        <Column dataField="createdAt" caption="Created" dataType="date" width={120} />
        <Column
          caption="Actions"
          width={80}
          cellRender={(cell) => (
            <button
              onClick={() => handleDelete(cell.data.id)}
              style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 12 }}
            >
              Delete
            </button>
          )}
        />
      </DataGrid>
    </div>
  );
}

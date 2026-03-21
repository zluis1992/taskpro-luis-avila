'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/app/core/models/project.model';
import { projectService } from '@/app/core/services/project.service';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getAll()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Dashboard</h1>
        <Link href="/projects" style={{
          background: '#3b82f6', color: '#fff', padding: '8px 16px',
          borderRadius: 6, fontSize: 14
        }}>
          View All Projects
        </Link>
      </div>

      {loading ? (
        <p style={{ color: '#666' }}>Loading projects...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            <StatCard label="Total Projects" value={projects.length} color="#3b82f6" />
            <StatCard label="My Tasks" value={0} color="#10b981" />
            <StatCard label="In Progress" value={0} color="#f59e0b" />
          </div>

          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Recent Projects</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {projects.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div style={{
                  background: '#fff', borderRadius: 8, padding: 20,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  cursor: 'pointer', transition: 'box-shadow 0.2s'
                }}>
                  <h3 style={{ fontSize: 16, marginBottom: 8 }}>{p.name}</h3>
                  <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>{p.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888' }}>
                    <span>Owner: {p.ownerName}</span>
                    <span>{p.members.length} members</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 8, padding: 20,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</div>
    </div>
  );
}

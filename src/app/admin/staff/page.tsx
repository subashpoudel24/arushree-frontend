'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ActionLink, Badge, Checkbox, Loading, Notice, PageHeader, Panel, Select, Table, Td, titleCase, useAction } from '@/components/admin/kit';
import { Button, Field } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api, errorMessage } from '@/lib/api';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'blocked';
}

interface Roles {
  available: string[];
  roles: { manager: string[]; editor: string[] };
}

const PERMISSION_LABELS: Record<string, string> = {
  dashboard: 'See the dashboard',
  'products.read': 'View products and categories',
  'products.write': 'Change products and categories',
  'media.write': 'Use and upload images',
  'media.delete': 'Delete images',
  orders: 'Manage orders',
  customers: 'Manage customers',
  coupons: 'Manage coupons',
  delivery: 'Manage delivery charges',
  reviews: 'Moderate reviews',
  content: 'Manage website content',
  settings: 'Change payment settings',
};

export default function AdminStaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[] | null>(null);
  const [roles, setRoles] = useState<Roles | null>(null);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const { busy, notice, run } = useAction();

  const load = useCallback(async () => {
    try {
      const [list, roleData] = await Promise.all([api<{ items: Staff[] }>('/admin/staff'), api<Roles>('/admin/roles')]);
      setStaff(list.items);
      setRoles(roleData);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await run(async () => {
      await api('/admin/staff', { method: 'POST', body: { email, role } });
      await load();
    }, 'Staff member added.');
    if (ok) setEmail('');
  };

  const update = (member: Staff, body: { role?: string; status?: string }) =>
    void run(async () => {
      await api(`/admin/staff/${member.id}`, { method: 'PATCH', body });
      await load();
    }, 'Staff member updated.');

  const togglePermission = (roleName: 'manager' | 'editor', permission: string, on: boolean) => {
    if (!roles) return;
    const current = roles.roles[roleName];
    const permissions = on ? [...current, permission] : current.filter((value) => value !== permission);
    setRoles({ ...roles, roles: { ...roles.roles, [roleName]: permissions } });
  };

  return (
    <>
      <PageHeader title="Staff and roles" />
      <Notice notice={notice} />
      <Loading error={error} ready={!!staff && !!roles}>
        {staff && roles && (
          <div className="space-y-6">
            <Table head={['Name', 'Email', 'Role', 'Status', '']} empty={!staff.length}>
              {staff.map((member) => (
                <tr key={member.id}>
                  <Td className="font-semibold">
                    {member.name}
                    {member.id === user?.id && <span className="ml-1 font-normal text-muted">(you)</span>}
                  </Td>
                  <Td>{member.email}</Td>
                  <Td>
                    <select
                      aria-label={`Role of ${member.name}`}
                      value={member.role}
                      disabled={busy}
                      onChange={(e) => {
                        const next = e.target.value;
                        if (next === 'customer' && !window.confirm(`Remove ${member.name} from staff?`)) return;
                        update(member, { role: next });
                      }}
                      className="min-h-11 rounded-lg border border-line bg-white px-2 text-sm">
                      <option value="editor">Editor</option>
                      <option value="manager">Manager</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="customer">Remove from staff</option>
                    </select>
                  </Td>
                  <Td>
                    <Badge tone={member.status === 'active' ? 'good' : 'bad'}>{titleCase(member.status)}</Badge>
                  </Td>
                  <Td>
                    <ActionLink
                      danger={member.status === 'active'}
                      disabled={busy}
                      onClick={() => {
                        if (member.status === 'active' && !window.confirm(`Block ${member.name}?`)) return;
                        update(member, { status: member.status === 'active' ? 'blocked' : 'active' });
                      }}>
                      {member.status === 'active' ? 'Block' : 'Unblock'}
                    </ActionLink>
                  </Td>
                </tr>
              ))}
            </Table>

            <div className="grid gap-6 lg:grid-cols-3">
              <Panel title="Add staff">
                <form onSubmit={add} className="space-y-4">
                  <Field label="Email of an existing account" hint="They must sign up first, so only they know their password." type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="editor">Editor</option>
                    <option value="manager">Manager</option>
                    <option value="super_admin">Super Admin</option>
                  </Select>
                  <Button type="submit" loading={busy}>
                    Add
                  </Button>
                </form>
              </Panel>
              {(['manager', 'editor'] as const).map((roleName) => (
                <Panel key={roleName} title={`${titleCase(roleName)} can`}>
                  {roles.available.map((permission) => (
                    <Checkbox
                      key={permission}
                      label={PERMISSION_LABELS[permission] ?? permission}
                      checked={roles.roles[roleName].includes(permission)}
                      onChange={(e) => togglePermission(roleName, permission, e.target.checked)}
                    />
                  ))}
                  <div className="mt-3">
                    <Button
                      loading={busy}
                      onClick={() => void run(() => api(`/admin/roles/${roleName}`, { method: 'PUT', body: { permissions: roles.roles[roleName] } }), `${titleCase(roleName)} permissions saved.`)}>
                      Save
                    </Button>
                  </div>
                </Panel>
              ))}
            </div>
            <p className="text-sm text-muted">Super Admins can do everything. Only they can manage staff and read the audit log.</p>
          </div>
        )}
      </Loading>
    </>
  );
}

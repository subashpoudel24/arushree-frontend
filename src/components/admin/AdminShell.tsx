'use client';

import { BarChart3, ClipboardList, FileText, FolderTree, Globe, Home, Image as ImageIcon, Mail, MessageSquare, Newspaper, Package, Quote, ScrollText, Settings, ShieldCheck, Tag, Truck, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert, Spinner } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

const AdminContext = createContext<{ can: (permission: string) => boolean }>({ can: () => false });
export const useAdmin = () => useContext(AdminContext);

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3, permission: 'dashboard' },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList, permission: 'orders' },
  { href: '/admin/products', label: 'Products', icon: Package, permission: 'products.read' },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree, permission: 'products.read' },
  { href: '/admin/customers', label: 'Customers', icon: Users, permission: 'customers' },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag, permission: 'coupons' },
  { href: '/admin/delivery', label: 'Delivery charges', icon: Truck, permission: 'delivery' },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare, permission: 'reviews' },
  { href: '/admin/homepage', label: 'Homepage', icon: Home, permission: 'content' },
  { href: '/admin/blogs', label: 'Blog', icon: Newspaper, permission: 'content' },
  { href: '/admin/pages', label: 'Pages', icon: FileText, permission: 'content' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Quote, permission: 'content' },
  { href: '/admin/messages', label: 'Messages', icon: Mail, permission: 'content' },
  { href: '/admin/site', label: 'Site settings', icon: Globe, permission: 'content' },
  { href: '/admin/media', label: 'Media library', icon: ImageIcon, permission: 'media.write' },
  { href: '/admin/settings', label: 'Payment settings', icon: Settings, permission: 'settings' },
  { href: '/admin/staff', label: 'Staff and roles', icon: ShieldCheck, permission: 'staff' },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText, permission: 'audit' },
];

export const AdminShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ permissions: string[] }>('/admin/session')
      .then((data) => setPermissions(data.permissions))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-xl p-6">
        <Alert>{error}</Alert>
      </main>
    );
  }
  if (!permissions) return <Spinner label="Loading admin panel" />;

  const links = NAV.filter((item) => permissions.includes(item.permission));
  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  return (
    <AdminContext.Provider value={{ can: (permission) => permissions.includes(permission) }}>
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col lg:flex-row">
        <nav aria-label="Admin" className="border-b border-line bg-white lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
          <ul className="flex gap-1 overflow-x-auto p-2 lg:sticky lg:top-16 lg:flex-col lg:p-3">
            {links.map(({ href, label, icon: Icon }) => (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium ${
                    isActive(href) ? 'bg-gold' : 'hover:bg-sand'
                  }`}>
                  <Icon size={18} aria-hidden /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </AdminContext.Provider>
  );
};

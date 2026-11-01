'use client';

import { CircleUserRound, Heart, LayoutDashboard, Menu, ShoppingBag, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const iconClass = 'relative flex size-11 items-center justify-center transition-colors hover:text-bronze';

export const Header = ({ siteName, logo }: { siteName: string; logo: { url: string } }) => {
  const { user, isStaff, logout } = useAuth();
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    await logout();
    router.push('/');
  };

  const count = cart?.itemCount ?? 0;
  // Signed-in customers see their orders. Guests can still track one by number.
  const links = [
    { href: '/shop', label: 'Shop' },
    { href: '/blogs', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: user ? '/orders' : '/track-order', label: 'Order' },
  ];

  const cartLink = (
    <Link href="/cart" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`} className={iconClass}>
      <ShoppingBag size={24} strokeWidth={1.6} aria-hidden />
      {count > 0 && (
        <span className="absolute right-0 top-0 flex min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs font-semibold text-cream">
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur">
      <div className="mx-auto grid h-20 max-w-[1500px] grid-cols-[1fr_auto] items-center px-4 sm:px-8 md:grid-cols-[1fr_auto_1fr] lg:px-28">
        <Link href="/" className="justify-self-start" aria-label={`${siteName} home`}>
          <Image src={logo.url} alt="" width={56} height={56} priority className="size-14 object-contain" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex lg:gap-10">
          {links.map((link) => (
            <Link key={link.label} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} className="link-line py-1 text-base uppercase tracking-wide">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-self-end gap-1 lg:gap-3">
          {isStaff && (
            <Link href="/admin" aria-label="Admin panel" className={`${iconClass} max-md:hidden`}>
              <LayoutDashboard size={22} strokeWidth={1.6} aria-hidden />
            </Link>
          )}
          <Link href="/favorites" aria-label="Favorites" className={iconClass}>
            <Heart size={24} strokeWidth={1.6} aria-hidden />
          </Link>
          {cartLink}
          <Link href={user ? '/account' : '/signin'} aria-label={user ? 'My account' : 'Sign in'} className={iconClass}>
            <CircleUserRound size={24} strokeWidth={1.6} aria-hidden />
          </Link>
          <button className={`${iconClass} md:hidden`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="flex flex-col items-start gap-1 border-t border-line px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="flex min-h-11 items-center text-sm uppercase tracking-wide">
              {link.label}
            </Link>
          ))}
          {isStaff && (
            <Link href="/admin" className="flex min-h-11 items-center text-sm uppercase tracking-wide">
              Admin
            </Link>
          )}
          {user && (
            <button onClick={signOut} className="flex min-h-11 items-center text-sm uppercase tracking-wide">
              Sign out
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

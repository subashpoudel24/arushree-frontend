import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Script from 'next/script';
import { ReactNode } from 'react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { getSite } from '@/lib/content';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSite();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aarushreelifesciences.com'),
    title: { default: site.siteName, template: `%s | ${site.siteName}` },
    description: 'Skincare and oral care products from Aarushree Life Sciences, Nepal.',
    openGraph: { siteName: site.siteName, type: 'website' },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { site, footerPages } = await getSite();
  // The API only accepts the G-XXXX format, so this is safe to place in a script.
  const analyticsId = site.googleAnalyticsId;

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased" suppressHydrationWarning>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <Header siteName={site.siteName} logo={site.logo} />
              <div id="content" className="flex flex-1 flex-col">
                {children}
              </div>
              <Footer site={site} pages={footerPages} />
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
        {analyticsId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} strategy="afterInteractive" />
            <Script id="analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${analyticsId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

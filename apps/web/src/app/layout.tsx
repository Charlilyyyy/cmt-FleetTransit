import type { Metadata, Viewport } from 'next';
import { DM_Sans, Outfit } from 'next/font/google';

import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    default: 'CMT Fleet Transit',
    template: '%s | CMT Fleet Transit',
  },
  description:
    'Multi-tenant fleet operations — route planning, live GPS, check-in, and guardian notifications',
  manifest: '/manifest.json',
  applicationName: 'CMT Fleet Transit',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CMT Fleet Transit',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0284c7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${outfit.variable} font-sans`}>
        <AuthProvider>{children}</AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

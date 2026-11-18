import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ElevateOS - Fleet Management & Control Application',
  description: 'Enterprise Multi-Tenant Smart Elevator Operations, Live Monitoring, Dispatch & Maintenance Application',
  applicationName: 'ElevateOS Application',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ElevateOS Application',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#433690',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                localStorage.setItem('elevateos-theme', 'light');
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-page text-main font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

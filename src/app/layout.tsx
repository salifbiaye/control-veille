import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { LocaleProvider } from "@/lib/i18n/locale-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://control.techwatches.space'),

  title: {
    default: 'TechWatches Admin — Panneau d\'administration',
    template: '%s | TechWatches Admin'
  },
  description: 'Panneau d\'administration TechWatches pour la gestion de la plateforme de veille technologique.',

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    siteName: 'TechWatches Admin',
    title: 'TechWatches Admin — Panneau d\'administration',
    description: 'Panneau d\'administration TechWatches pour la gestion de la plateforme de veille technologique.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'TechWatches Admin',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'TechWatches Admin — Panneau d\'administration',
    description: 'Panneau d\'administration TechWatches pour la gestion de la plateforme de veille technologique.',
    images: ['/og.png'],
  },

  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  applicationName: 'TechWatches Admin',
  appleWebApp: {
    capable: true,
    title: 'TW Admin',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

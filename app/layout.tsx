import './globals.css';
import 'lenis/dist/lenis.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Analytics from '@/components/Analytics/Analytics';
import MobileSiteBlocker from '@/components/MobileSiteBlocker/MobileSiteBlocker';
import ThemeAwareFavicon from '@/components/ThemeAwareFavicon/ThemeAwareFavicon';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.heywhoisdash.com'),
  title: 'Dash',
  description: 'Personal Portfolio website of Dash'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className='h-full'
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} flex min-h-full flex-col items-stretch`}
      >
        <Analytics />

        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <ThemeAwareFavicon />

          <MobileSiteBlocker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

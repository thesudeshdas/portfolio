import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

// import components
import { AppNav, Footer } from '@/components/index';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
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
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div className='fixed inset-0 z-[-2] bg-linear-to-b from-zinc-50 from-80% to-zinc-50 dark:from-zinc-900 dark:to-zinc-900'></div>

          <AppNav />

          <div className='overflow mx-auto flex w-full max-w-[1000px] grow flex-col'>
            <div className='flex-col items-center px-4'>{children}</div>

            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

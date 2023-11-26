import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

// import components
import AppNav from '@/components/AppNav/AppNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div className='fixed inset-0 z-[-2] bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-900 from-zinc-50 to-zinc-50'></div>

          <AppNav />

          <div className='flex flex-col min-h-screen max-w-[1000px] mx-auto'>
            <div className='flex-col items-center px-4'>{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

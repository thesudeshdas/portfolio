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
    >
      <body
        className={`${inter.className} flex flex-col items-stretch min-h-full `}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div className='fixed inset-0 z-[-2] bg-gradient-to-b from-80% dark:from-zinc-900 dark:to-zinc-900 from-zinc-50 to-zinc-50'></div>

          <AppNav />

          <div className='flex flex-col max-w-[1000px] mx-auto flex-grow w-full'>
            <div className='flex-col items-center px-4'>{children}</div>
          </div>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

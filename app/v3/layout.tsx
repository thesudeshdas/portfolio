import type { Metadata } from 'next';
import V3BodyClass from '@/components/V3BodyClass/V3BodyClass';

export const metadata: Metadata = {
  title: 'Dash | Under Renovation',
  description:
    'A temporary portfolio page for Sudesh Das while the new site is being rebuilt.'
};

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <V3BodyClass />

      {children}
    </>
  );
}

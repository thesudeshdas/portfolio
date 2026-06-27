import V2BodyClass from '@/components/V2BodyClass/V2BodyClass';
import V2Cursor from '@/components/V2Cursor/V2Cursor';

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <V2BodyClass />
      <V2Cursor />

      {children}
    </>
  );
}

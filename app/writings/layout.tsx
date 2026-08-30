import V2BodyClass from '@/components/V2BodyClass/V2BodyClass';

export default function WritingsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <V2BodyClass />

      {children}
    </>
  );
}

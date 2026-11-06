import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'Privacy policy for Delilah, the personal assistant of Dash'
};

const sections = [
  {
    title: 'What Delilah is',
    body: 'Delilah is a private assistant built and used only by Dash (Sudesh Das). It is not offered to the public and has no other users.'
  },
  {
    title: 'What data it accesses',
    body: "With Dash's consent through Google OAuth, Delilah reads, labels, archives, drafts and sends email in Dash's own Gmail account to help manage that inbox."
  },
  {
    title: 'How data is used and stored',
    body: "Email data is processed on Dash's own computer only to carry out tasks Dash asks for. It is not sold, shared with third parties, or used for advertising. OAuth tokens are stored locally and can be revoked at any time from the Google Account permissions page."
  },
  {
    title: 'Google API services',
    body: "Delilah's use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements."
  },
  {
    title: 'Contact',
    body: 'Questions about this policy: sudeshkumardas7@gmail.com.'
  }
];

export default function PrivacyPage() {
  return (
    <main
      className={`${outfit.className} v2-page min-h-[100dvh] bg-[var(--v2-page-bg)] px-6 py-24 text-[var(--v2-text)]`}
    >
      <section className='mx-auto w-full max-w-xl'>
        <p className='mb-5 text-sm text-[var(--v2-text-muted)]'>
          Hey, Who Is Dash?
        </p>
        <h1 className='text-5xl !leading-[1.02] font-extralight tracking-[-0.05em] text-[var(--v2-text-strong)] sm:text-7xl'>
          Privacy policy
        </h1>
        <p className='mt-4 text-sm text-[var(--v2-text-muted)]'>
          Last updated 6 November 2026
        </p>
        {sections.map((section) => (
          <div
            className='mt-10'
            key={section.title}
          >
            <h2 className='text-lg text-[var(--v2-text-strong)]'>
              {section.title}
            </h2>
            <p className='mt-3 text-base !leading-7'>{section.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

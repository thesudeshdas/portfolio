import { Cormorant_Garamond } from 'next/font/google';
import { socialLinks } from '@/data/social/social.data';
import ModeToggle from '@/components/ModeToggle/ModeToggle';
import V3FadeIn from '@/components/V3FadeIn/V3FadeIn';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export default function V3Page() {
  return (
    <main
      className={`${serif.className} v3-page min-h-[100dvh] bg-[#f5ebe0] text-[#2a1a0e] dark:bg-[#1a1210] dark:text-[#eddcc8]`}
    >
      <div className='fixed top-5 right-5 z-10 sm:right-auto sm:left-[calc(50%+356px)]'>
        <ModeToggle />
      </div>

      <article className='mx-auto max-w-[680px] px-6 py-16 sm:px-8 sm:py-24'>
        <header className='mb-16 sm:mb-20'>
          <V3FadeIn delay={0}>
            <p className='mb-8 text-[15px] leading-[1.75] font-semibold tracking-[0.15em] text-[#7a5a3e] dark:text-[#b89a78]'>
              portfolio site under construction
              <br />
              until then, here&apos;s something about me
            </p>
          </V3FadeIn>

          <V3FadeIn delay={120}>
            <h1 className='mb-6 text-5xl leading-[1.1] font-semibold sm:text-7xl sm:leading-[1.08]'>
              hi, i am dash
            </h1>
          </V3FadeIn>
        </header>

        <V3FadeIn delay={240}>
          <div className='mb-14 h-px bg-[#c9b49a]/40 dark:bg-[#5a4535]/60' />
        </V3FadeIn>

        <section className='mb-14'>
          <V3FadeIn delay={360}>
            <p className='mb-6 text-lg leading-[1.75] font-medium'>
              i am Sudesh Das, i also go by Dash. i am a product engineer who
              takes ideas from rough shape to working software
            </p>
          </V3FadeIn>

          <V3FadeIn delay={480}>
            <p className='text-lg leading-[1.75] font-medium'>
              my work spans web and mobile applications, backend systems, AI
              workflows, career and talent products, community platforms, and
              the operational glue that keeps things moving
            </p>
          </V3FadeIn>
        </section>

        <V3FadeIn delay={600}>
          <div className='mb-14 h-px bg-[#c9b49a]/40 dark:bg-[#5a4535]/60' />
        </V3FadeIn>

        <section className='mb-14'>
          <V3FadeIn delay={720}>
            <p className='mb-8 text-[15px] font-semibold tracking-[0.15em] text-[#7a5a3e] dark:text-[#b89a78]'>
              where i have been/i am
            </p>
          </V3FadeIn>

          <div className='flex flex-col gap-10'>
            <V3FadeIn delay={840}>
              <div>
                <p className='flex flex-col gap-1 text-lg leading-[1.75] font-medium sm:flex-row sm:items-baseline sm:justify-between'>
                  <span className='font-bold'>
                    Software Engineer at{' '}
                    <a
                      href='https://growthx.club/'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='underline decoration-[#c9b49a]/50 underline-offset-4 transition-colors hover:text-[#7a5a3e] hover:decoration-[#7a5a3e] dark:decoration-[#5a4535] dark:hover:text-[#eddcc8] dark:hover:decoration-[#b89a78]'
                    >
                      GrowthX
                    </a>
                  </span>
                  <span className='text-[#7a5a3e] dark:text-[#b89a78]'>
                    may 2024 &ndash; present
                  </span>
                </p>
                <p className='mt-1 text-lg leading-[1.75] font-medium text-[#4a3425] dark:text-[#c4a98e]'>
                  building production systems across web, mobile, backend, AI
                  workflows, events, community, jobs, talent, notifications and
                  platform tooling
                </p>
              </div>
            </V3FadeIn>

            <V3FadeIn delay={120}>
              <div>
                <p className='flex flex-col gap-1 text-lg leading-[1.75] font-medium sm:flex-row sm:items-baseline sm:justify-between'>
                  <span className='font-bold'>
                    Frontend Developer at{' '}
                    <a
                      href='https://talentplace.ai/'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='underline decoration-[#c9b49a]/50 underline-offset-4 transition-colors hover:text-[#7a5a3e] hover:decoration-[#7a5a3e] dark:decoration-[#5a4535] dark:hover:text-[#eddcc8] dark:hover:decoration-[#b89a78]'
                    >
                      TalentPlace.ai
                    </a>
                  </span>
                  <span className='text-[#7a5a3e] dark:text-[#b89a78]'>
                    feb 2023 &ndash; may 2024
                  </span>
                </p>
                <p className='mt-1 text-lg leading-[1.75] font-medium text-[#4a3425] dark:text-[#c4a98e]'>
                  career products: profile editors, resume flows, job search
                  surfaces, application views and shared frontend infrastructure
                </p>
              </div>
            </V3FadeIn>

            <V3FadeIn delay={120}>
              <div>
                <p className='flex flex-col gap-1 text-lg leading-[1.75] font-medium sm:flex-row sm:items-baseline sm:justify-between'>
                  <span className='font-bold'>
                    Teaching Assistant at{' '}
                    <a
                      href='https://neog.camp/'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='underline decoration-[#c9b49a]/50 underline-offset-4 transition-colors hover:text-[#7a5a3e] hover:decoration-[#7a5a3e] dark:decoration-[#5a4535] dark:hover:text-[#eddcc8] dark:hover:decoration-[#b89a78]'
                    >
                      NeoG
                    </a>
                  </span>
                  <span className='text-[#7a5a3e] dark:text-[#b89a78]'>
                    jan 2022 &ndash; jul 2022
                  </span>
                </p>
                <p className='mt-1 text-lg leading-[1.75] font-medium text-[#4a3425] dark:text-[#c4a98e]'>
                  mentored web development students, ran coding sessions, helped
                  with doubts and maintained learning platform content
                </p>
              </div>
            </V3FadeIn>
          </div>
        </section>

        <V3FadeIn>
          <div className='mb-14 h-px bg-[#c9b49a]/40 dark:bg-[#5a4535]/60' />
        </V3FadeIn>

        <section className='mb-16'>
          <V3FadeIn>
            <p className='text-lg leading-[1.75] font-medium'>
              the full portfolio is brewing. i will be back with something worth
              your time. until then, the fastest way to reach me is email
            </p>
          </V3FadeIn>
        </section>

        <footer>
          <V3FadeIn>
            <p className='mb-10 text-lg leading-[1.75] font-medium'>
              peace,
              <br />
              dash
            </p>
          </V3FadeIn>

          <V3FadeIn>
            <div className='border-t border-[#c9b49a]/40 pt-8 dark:border-[#5a4535]/60'>
              <p className='mb-4 text-[15px] font-semibold tracking-[0.15em] text-[#7a5a3e] dark:text-[#b89a78]'>
                p.s. you can find me here
              </p>

              <div className='flex flex-wrap gap-x-6 gap-y-2'>
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target={link.name === 'Email' ? undefined : '_blank'}
                    rel={
                      link.name === 'Email' ? undefined : 'noopener noreferrer'
                    }
                    aria-label={link.label}
                    className='text-lg font-medium text-[#4a3425] underline decoration-[#c9b49a]/50 underline-offset-4 transition-colors hover:text-[#2a1a0e] hover:decoration-[#7a5a3e] dark:text-[#c4a98e] dark:decoration-[#5a4535] dark:hover:text-[#eddcc8] dark:hover:decoration-[#b89a78]'
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </V3FadeIn>
        </footer>
      </article>
    </main>
  );
}

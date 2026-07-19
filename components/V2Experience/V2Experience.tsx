import {
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiYoutube
} from 'react-icons/fi';
import { Noto_Emoji, Outfit } from 'next/font/google';

import V2AttributionPopover from './V2AttributionPopover';
import V2IntroAnimation from './V2IntroAnimation';
import V2MusicPlayer from './V2MusicPlayer';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700']
});

const notoEmoji = Noto_Emoji({
  subsets: ['emoji'],
  weight: '400'
});

const socialLabels = [
  { icon: FiLinkedin, label: 'LinkedIn' },
  { icon: FiGithub, label: 'GitHub' },
  { icon: FiInstagram, label: 'Instagram' },
  { icon: FiYoutube, label: 'YouTube' },
  { icon: FiMail, label: 'Email' }
];

export default function V2Experience() {
  return (
    <main
      data-v2-content-cursor='true'
      className='v2-page min-h-[100dvh] bg-black p-1.5 text-zinc-200 sm:p-2.5'
    >
      <section className='relative flex min-h-[calc(100dvh-0.75rem)] items-center justify-center sm:min-h-[calc(100dvh-1.25rem)]'>
        <span
          className={`${outfit.className} absolute top-2.5 right-2.5 text-[24px] font-extralight text-zinc-100 sm:top-4.5 sm:right-4.5 lg:top-6 lg:right-6`}
          style={{ lineHeight: '100%' }}
        >
          work
        </span>

        <V2IntroAnimation emojiClassName={notoEmoji.className} />

        <V2MusicPlayer fontClassName={outfit.className} />

        <div className='absolute right-2.5 bottom-2.5 flex flex-col items-end gap-3 sm:right-4.5 sm:bottom-4.5 lg:right-6 lg:bottom-6'>
          <div
            aria-label='Social media'
            className='flex items-center gap-3 text-xl leading-none font-medium text-zinc-100 sm:gap-5 sm:text-2xl'
          >
            {socialLabels.map((social) => {
              const Icon = social.icon;

              return (
                <span
                  key={social.label}
                  aria-label={social.label}
                  title={social.label}
                >
                  <Icon
                    aria-hidden='true'
                    className='size-5 sm:size-6'
                    strokeWidth={0.75}
                  />
                </span>
              );
            })}
          </div>

          <V2AttributionPopover fontClassName={outfit.className} />
        </div>
      </section>
    </main>
  );
}

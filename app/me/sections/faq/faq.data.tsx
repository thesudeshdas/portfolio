import { IFaqItem } from '@/types/faq/faq.types';

export function ReachOut() {
  return (
    <p>
      If you want career advice, I do not believe I am qualified or experienced
      enough to give anyone advice. My suggestion would be to find someone who
      has proven themselves in the industry and have been working since a few
      years. That said, you can reach out to me on my socials. But emailing
      would be the fastest way. Email me at{' '}
      <a
        href='mailto:sudeshkumardas7@gmail.com'
        className='border-b-[1px] border-foreground'
      >
        sudeshkumardas7@gmail.com
      </a>
      .
    </p>
  );
}

export function GotStarted() {
  return (
    <p>
      I got into web development during the COVID-19 lockdown. I needed
      something to do and my friend suggested programming. I learnt the basics
      from YouTube, then got into{' '}
      <a
        href='https://neog.camp'
        className='border-b-[1px] border-foreground'
        rel='noreferrer'
        target='_blank'
      >
        NeoG
      </a>
      , a six week boot camp by{' '}
      <a
        href='https://tanaypratap.com'
        className='border-b-[1px] border-foreground'
        rel='noreferrer'
        target='_blank'
      >
        Tanay Pratap
      </a>{' '}
      . I also started freelancing along with two of my friends, which gave me
      exposure into how the industry works. .
    </p>
  );
}

export function CommerceToCoding() {
  return (
    <div className='flex flex-col gap-2'>
      <p>Yes and No.</p>

      <p>
        Yes, some people judge that I am not as good as someone who has done
        B.Tech in CS. And that is true. He/she got a chance to study the
        fundamentals during the building years of his/her life in a very
        systematic order.
      </p>

      <p>
        No, if you truly enjoy doing something, you would find a way to do it
        regardless of how many obstacles come your way. Being from a different
        field just gives us the opportunity to learn more & expand our knowledge
      </p>

      <p>
        PS - On that note, yes, I have to put extra efforts to keep at par
        because I am not aware of many terms that are used in the daily
        conversations.
      </p>
    </div>
  );
}

export const faqList: IFaqItem[] = [
  {
    id: '0ee335fe-b2e0-46f2-9d6f-f31cab107d60',
    question: `Is this FAQ section even needed? Who are asking these questions?`,
    answer: `Honestly no. XD. But because I can, I made this. On a serious note, I do come across people who usually have this chain of questions and thus I decided to answer in that order. And a few things that I would the world to know about.`
  },
  {
    id: 'b8762c4d-e3f5-4a66-9c7d-2e89b3f51a90',
    question: `Why Dash?`,
    answer: `My real name is Sudesh. I go by "Dash" when I play online games. Also, since people started butchering my actual name, I just ask people to call me Dash. Simple to pronounce. Yet still, people mess this up as well 😆`
  },

  {
    id: 'c7653d5e-f4g6-5b77-8d8e-3f90a4b52c60',
    question: `How did you get into web development?`,
    answer: <GotStarted />
  },
  {
    id: 'd6542e6f-g5h7-4c88-8e9f-4g00b5c63d70',
    question: `What degree do you have in Computer Science?`,
    answer: `None. I am formally educated in Commerce as I always had an interest in finance. I completed my Bachelor of Commerce (Hons) in Management from Ravenshaw University`
  },
  {
    id: 'e5431f7g-h6i8-4d99-9f0g-5h11c6d74e80',
    question: `From commerce to coding? Was it difficult to transition?`,
    answer: <CommerceToCoding />
  },
  {
    id: 'f4320g8h-i7j9-4e00-0g1h-6i22d7e85f90',
    question: `Is it expensive to learn web development? Especially since you are not from the CS field`,
    answer: `Nope. everything is on YouTube, blogs, docs. Join a community, subscribe to some newsletters, and you are good to learn anything new (not just web development)`
  },
  {
    id: 'g3210h9i-j8k0-4f11-1g2i-7j33e8f96g00',
    question: `I need some advice. How can I reach out?`,
    answer: <ReachOut />
  }
];

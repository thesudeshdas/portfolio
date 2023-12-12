'use client';

export default function About() {
  return (
    <div className='flex flex-col gap-6'>
      <h2 className='font-bold text-3xl'>About </h2>

      <div className='flex flex-col gap-2'>
        <p>
          Hey there 👋 I am Sudesh Das. Then why &ldquo;Dash&rdquo;, you ask?
          It&apos;s my gaming alias.
        </p>

        <p>
          I am a fullstack developer working at an early-stage start-up called{' '}
          <a
            href='https://www.talentplace.ai/'
            rel='noreferrer'
            target='_blank'
            className='border-b-[1px] border-foreground'
          >
            TalentPlace.ai
          </a>
          . Here, I am in charge of the complete frontend part of three
          production web apps adhering to ~100k users.
        </p>

        <p>
          Other than my day job 🌞, I am passionate about building products from
          scratch. What I actually mean by this is that I like to create a
          product [the techie part], understand the user behaviour (read
          experience) when they use it, market, manage the finances, and
          everything else that comprises of making the product usable and
          lovable.
        </p>

        <p>
          So, have I built anything yet? Nope. But, I am currently building{' '}
          <a
            href='https://catalyst.netlify.app/'
            rel='noreferrer'
            target='_blank'
            className='border-b-[1px] border-foreground'
          >
            Catalyst
          </a>
          .
        </p>

        <p>
          In my personal time. I play video games (apparently a little too much
          😅). I also enjoy football and bikes. If you are someone who has any
          overlapping interests and wants to have a chat, feel free to HMU on
          socials (Most active on emails though)
        </p>
      </div>
    </div>
  );
}

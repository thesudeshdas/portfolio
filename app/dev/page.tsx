import { devProjectList } from './dev.data';
import DevProjectList from './sections/DevProjectList';

export default function Dev() {
  return (
    <div className='py-12 flex flex-col gap-4'>
      <div className='flex flex-col gap-4'>
        <h2 className='font-bold text-4xl'>Creation</h2>

        <p>
          Passionate about building from scratch, these are just a few of my
          projects that I have worked on. Currently I am working on{' '}
          <a
            href='https://github.com/thesudeshdas/catalyst'
            target='_blank'
            rel='noopener noreferrer'
            className='underline font-semibold'
          >
            Catalyst
          </a>
          , a developer portfolio platform built for devs to show off what they
          have built
        </p>
      </div>

      <DevProjectList initialProjects={devProjectList} />
    </div>
  );
}

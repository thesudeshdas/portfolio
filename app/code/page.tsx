import { devProjectList } from './dev.data';
import DevProjectList from './sections/DevProjectList';

export default function Dev() {
  return (
    <div className='flex flex-col gap-4 py-12'>
      <div className='flex flex-col gap-4'>
        <h2 className='text-4xl font-bold'>Creation</h2>
        <p>
          Passionate about building from scratch, these are just a few of my
          projects that I have worked on.
        </p>
      </div>

      <DevProjectList initialProjects={devProjectList} />
    </div>
  );
}

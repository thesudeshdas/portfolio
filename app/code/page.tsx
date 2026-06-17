import { devProjectList } from './dev.data';
import DevProjectList from './sections/DevProjectList';

export default function Dev() {
  return (
    <div className='flex flex-col gap-4 py-12'>
      <div className='flex flex-col gap-4'>
        <h2 className='text-4xl font-bold'>Engineering Work</h2>
        <p>
          Product systems I have built across web, mobile, backend and career
          tooling.
        </p>
      </div>

      <DevProjectList initialProjects={devProjectList} />
    </div>
  );
}

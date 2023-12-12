'use client';

import { Badge } from '@/components/ui/badge';
import { allSkills } from './skillBank.data';

export default function SkillBank() {
  return (
    <div className='flex flex-col gap-6'>
      <h2 className='font-bold text-3xl'>Skills</h2>

      <ul className='flex flex-row flex-wrap flex-shrink-0 gap-4 '>
        {allSkills?.map((skill) => (
          <Badge
            key={skill.id}
            className='py-1 bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 hover:dark:bg-zinc-700 cursor-pointer'
          >
            {skill.name}
          </Badge>
        ))}
      </ul>
    </div>
  );
}

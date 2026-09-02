'use client';

import { Badge } from '@/components/ui/badge';
import { allSkills } from './skillBank.data';
import SectionHeader from '@/components/SectionHeader/SectionHeader';

export default function SkillBank() {
  return (
    <div className='flex flex-col gap-6'>
      <SectionHeader text='Skills' />

      <ul className='flex shrink-0 flex-row flex-wrap gap-4'>
        {allSkills?.map((skill) => (
          <Badge
            key={skill.id}
            className='text-foreground cursor-pointer bg-zinc-100 py-1 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
          >
            {skill.name}
          </Badge>
        ))}
      </ul>
    </div>
  );
}

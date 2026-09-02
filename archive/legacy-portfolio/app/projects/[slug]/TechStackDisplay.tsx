'use client';

import { Badge } from '@/components/ui/badge';
import { resolveTechStack } from '@/data/icons/techStackMap';

export default function TechStackDisplay({
  techStack
}: {
  techStack: string[];
}) {
  const resolved = resolveTechStack(techStack);

  return (
    <ul className='flex flex-wrap gap-2'>
      {resolved.map((tech) => (
        <Badge
          key={tech.id}
          className='text-foreground bg-zinc-100 py-1 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
        >
          {tech.name}
        </Badge>
      ))}
    </ul>
  );
}

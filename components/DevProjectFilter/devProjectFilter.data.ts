// import uuid
import { v4 as uuidv4 } from 'uuid';

// import types
import { IDevFilterBadgeOptionItem } from '@/types/dev/dev.types';

export const devFiltersBadgesOptions: IDevFilterBadgeOptionItem[] = [
  {
    id: uuidv4(),
    label: 'ReactJS'
  },
  {
    id: uuidv4(),
    label: 'CSS3'
  },
  {
    id: uuidv4(),
    label: 'TypeScript'
  },
  {
    id: uuidv4(),
    label: 'Express'
  },
  {
    id: uuidv4(),
    label: 'Featured'
  }
];

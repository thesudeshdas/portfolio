import { v4 as uuidv4 } from 'uuid';

// import types
import { IAppNavLink } from '@/types/navs/navs.types';

export const appNavLinks: IAppNavLink[] = [
  {
    id: uuidv4(),
    link: '/dev',
    text: 'Dev'
  },
  // {
  //   id: uuidv4(),
  //   link: '/blogs',
  //   text: 'Blogs'
  // },
  {
    id: uuidv4(),
    link: '/me',
    text: 'Me'
  }
];

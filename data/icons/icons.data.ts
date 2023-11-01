// import uuid
import { v4 as uuidv4 } from 'uuid';

// import icons
import {
  SiReact,
  SiNextdotjs,
  SiExpress,
  SiChakraui,
  SiGit
} from 'react-icons/si';

// import types
import { ITechStackLogo } from '@/types/icons/icons.types';

export const ReactJS: ITechStackLogo = {
  id: uuidv4(),
  name: 'React',
  logo: SiReact,
  color: '#61DAFB',
  colorName: 'react'
};

export const NextJS: ITechStackLogo = {
  id: uuidv4(),
  name: 'Next.js',
  logo: SiNextdotjs,
  color: '#000000',
  colorName: 'black'
};

export const Express: ITechStackLogo = {
  id: uuidv4(),
  name: 'Express',
  logo: SiExpress,
  color: '#000000',
  colorName: 'black'
};

export const ChakraUI: ITechStackLogo = {
  id: uuidv4(),
  name: 'Chakra UI',
  logo: SiChakraui,
  color: '#319795',
  colorName: 'chakra'
};

export const Git: ITechStackLogo = {
  id: uuidv4(),
  name: 'Git',
  logo: SiGit,
  color: '#F05032',
  colorName: 'git'
};

// import uuid
import { v4 as uuidv4 } from 'uuid';

// import types
import { IDevProjectListItem } from '@/types/dev/dev.types';

// import assets
import talentplaceLogo from '../../assets/images/talentplace-white.svg';
import neoGLogo from '../../assets/images/neog-white.svg';

// import data
import {
  Bootstrap,
  CSS3,
  ChakraUI,
  ContextAPI,
  Express,
  HTML5,
  JavaScript,
  MongoDB,
  NextJS,
  NodeJS,
  ReactJS,
  ReduxToolkit,
  Turborepo,
  TypeScript
} from '@/data/icons/icons.data';

export const devProjectList: IDevProjectListItem[] = [
  {
    id: uuidv4(),
    description: `Data driven job portal which generates candidates based on the
    requirements of the job. Queries through ~100k candidates &
    recommends the top candidates along with a detailed matching report`,
    image: '/gojo-compressed.png',
    live: 'https://job-tp.vercel.app/',
    organisation: 'TalentPlace.ai',
    organisationLogo: talentplaceLogo,
    techStack: [ReactJS, TypeScript, ChakraUI, Turborepo, ReduxToolkit],
    title: 'Job Portal',
    featured: true
  },
  {
    id: uuidv4(),
    description: `Data driven digital career profile builder based on over 500 data points for levelling up career. Choose from over 80 aesthetic & performant templates to download the resume`,
    image: '/gojo-compressed.png',
    live: 'https://www.talentplace.ai/',
    organisation: 'TalentPlace.ai',
    organisationLogo: talentplaceLogo,
    techStack: [ReactJS, TypeScript, ChakraUI, Turborepo, ReduxToolkit],
    title: 'Resume Builder',
    featured: true
  },
  {
    id: uuidv4(),
    description: `Developer portfolio platform where devs can show off their projects & blogs. Why spend time learning designing, marketing and selling when the programmers can work on what they do best`,
    image: '/gojo-compressed.png',
    live: 'https://catalyst-react.netlify.app/',
    techStack: [ReactJS, TypeScript, ChakraUI, Express, NodeJS, MongoDB],
    title: 'Catalyst',
    sourceCode: 'https://github.com/thesudeshdas/catalyst',
    featured: true
  },
  {
    id: uuidv4(),
    description: `E-commerce store for selling fitness & football accessories. Built to showcase the fundamental knowledge of a full stack web app building`,
    image: '/gojo-compressed.png',
    live: 'https://dashtra.netlify.app/',
    techStack: [ReactJS, JavaScript, ContextAPI, Express, NodeJS, MongoDB],
    title: 'Dashtra',
    sourceCode: 'https://github.com/thesudeshdas/dashtra'
  },
  {
    id: uuidv4(),
    description: `Admission portal for NeoG Camp, a six months boot camp to become full stack developer`,
    image: '/gojo-compressed.png',
    live: 'https://neog.camp/',
    techStack: [NextJS, TypeScript, ChakraUI],
    title: 'NeoG Camp',
    organisation: 'NeoG',
    organisationLogo: neoGLogo
  },
  {
    id: uuidv4(),
    description: `Admission portal for NeoG Camp, a six months boot camp to become full stack developer`,
    image: '/gojo-compressed.png',
    live: 'https://admissions2023.vercel.app/',
    techStack: [NextJS, TypeScript, ChakraUI, Express, NodeJS, MongoDB],
    title: 'NeoG Admissions',
    organisation: 'NeoG',
    organisationLogo: neoGLogo
  },
  {
    id: uuidv4(),
    description: `The classic game of tic-tac-toe lets the user play against a computer, or against another player`,
    image: '/gojo-compressed.png',
    live: 'https://dash-tic-tac-toe.netlify.app/',
    techStack: [HTML5, JavaScript, Bootstrap],
    title: 'Tic Tac Toe',
    sourceCode: 'https://github.com/thesudeshdas/tic-tac-toe'
  },
  {
    id: uuidv4(),
    description: `The etch-a-sketch lets the user drag the mouse over to leave a trail over a space. The trail can be of black or random colors using the buttons. The Reset button lets the user to change the grid size`,
    image: '/gojo-compressed.png',
    live: 'https://thesudeshdas.github.io/etch-a-sketch/',
    techStack: [HTML5, JavaScript, CSS3],
    title: 'Etch a Sketch',
    sourceCode: 'https://github.com/thesudeshdas/etch-a-sketch'
  }
];

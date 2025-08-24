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
  Express,
  HTML5,
  JavaScript,
  MongoDB,
  NextJS,
  NodeJS,
  ReactJS,
  ReduxToolkit,
  TailwindCSS,
  Turborepo,
  TypeScript
} from '@/data/icons/icons.data';

export const devProjectList: IDevProjectListItem[] = [
  {
    id: 'o4015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `Data driven job portal which generates candidates based on the
    requirements of the job. Queries through ~100k candidates &
    recommends the top candidates along with a detailed matching report`,
    image: '/dev/jobPortal.png',
    live: 'https://job-tp.vercel.app/',
    organisation: 'TalentPlace.ai',
    organisationLogo: talentplaceLogo,
    techStack: [ReactJS, TypeScript, ChakraUI, Turborepo, ReduxToolkit],
    title: 'Job Portal',
    featured: true
  },
  {
    id: 'p3006t4u-v4n0-4o00-nr1p-6s03q7r95o50',
    description: `Data driven digital career profile builder based on over 500 data points for levelling up career. Choose from over 80 aesthetic & performant templates to download the resume`,
    image: '/dev/resumeBuilder.png',
    live: 'https://www.talentplace.ai/',
    organisation: 'TalentPlace.ai',
    organisationLogo: talentplaceLogo,
    techStack: [ReactJS, TypeScript, ChakraUI, Turborepo, ReduxToolkit],
    title: 'Resume Builder',
    featured: true
  },
  {
    id: 'r3034v0w-x1o8-4q88-pt9r-4u81s5t73q70',
    description: `Developer portfolio platform where devs can show off their projects & blogs. Why spend time learning designing, marketing and selling when the programmers can work on what they do best`,
    image: '/dev/catalyst.png',
    live: 'https://catalyst-dash.vercel.app',
    techStack: [ReactJS, TypeScript, TailwindCSS, Express, NodeJS, MongoDB],
    title: 'Catalyst',
    sourceCode: 'https://github.com/thesudeshdas/catalyst-2.0',
    featured: true
  },
  {
    id: 's4045w1x-y2o9-4r99-qu0s-5v14t6u84r60',
    description: `E-commerce store for selling fitness & football accessories. Built to showcase the fundamental knowledge of a full stack web app building`,
    image: '/dev/dashtra.png',
    live: 'https://dashtra.netlify.app/',
    techStack: [ReactJS, JavaScript, Express, NodeJS, MongoDB],
    title: 'Dashtra',
    sourceCode: 'https://github.com/thesudeshdas/dashtra',
    featured: true
  },
  {
    id: 't5056x2y-z3p0-4s00-rv1t-6w25u7v95s50',
    description: `Admission portal for NeoG Camp, a six months boot camp to become full stack developer`,
    image: '/dev/neog.png',
    live: 'https://neog.camp/',
    techStack: [NextJS, TypeScript, ChakraUI],
    title: 'NeoG Camp',
    organisation: 'NeoG',
    organisationLogo: neoGLogo
  },
  {
    id: 'u0877y5z-a4q1-4r00-sw2u-7x36v8w06t40',
    description: `Admission portal for NeoG Camp, a six months boot camp to become full stack developer`,
    image: '/dev/admissions.png',
    live: 'https://admissions2023.vercel.app/',
    techStack: [NextJS, TypeScript, ChakraUI, Express, NodeJS, MongoDB],
    title: 'NeoG Admissions',
    organisation: 'NeoG',
    organisationLogo: neoGLogo
  },
  {
    id: 'v1988z6a-b5r2-4s11-tx3v-9y47w5z67u30',
    description: `The classic game of tic-tac-toe lets the user play against a computer, or against another player`,
    image: '/dev/ticTacToe.png',
    live: 'https://dash-tic-tac-toe.netlify.app/',
    techStack: [HTML5, JavaScript, Bootstrap],
    title: 'Tic Tac Toe',
    sourceCode: 'https://github.com/thesudeshdas/tic-tac-toe'
  },
  {
    id: 'w2000a7b-c6s3-4t44-uy4w-9z51x6y78v20',
    description: `The Rock-Paper-Scissors game let's the user play the classic game against the computer`,
    image: '/dev/rockPaperScissors.png',
    live: 'https://dash-rock-paper-scissors.netlify.app/',
    techStack: [HTML5, JavaScript, CSS3],
    title: 'Rock Paper Scissors',
    sourceCode: 'https://github.com/thesudeshdas/rock-paper-scissors'
  },
  {
    id: 'x3011b8c-d7t4-4u55-vz5x-0a62y7z89w30',
    description: `The etch-a-sketch lets the user drag the mouse over to leave a trail over a space. The trail can be of black or random colors using the buttons. The Reset button lets the user to change the grid size`,
    image: '/dev/etchASketch.png',
    live: 'https://thesudeshdas.github.io/etch-a-sketch/',
    techStack: [HTML5, JavaScript, CSS3],
    title: 'Etch a Sketch',
    sourceCode: 'https://github.com/thesudeshdas/etch-a-sketch'
  }
];

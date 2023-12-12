// import uuid
import { v4 as uuidv4 } from 'uuid';

// import types
import { IJourneyListItem } from '@/types/journey/journey.types';

// import assets
import talentplaceLogo from '../../../../assets/images/talentplace-white.svg';
import neoGLogo from '../../../../assets/images/neog-white.svg';
import glarizonLogo from '../../../../assets/images/glarizon-white.svg';

// import icons
import {
  ApacheECharts,
  Axios,
  Bootstrap,
  CSS3,
  Canva,
  ChakraUI,
  Django,
  ESLint,
  Express,
  Figma,
  Framer,
  Git,
  GitHub,
  GitLab,
  HTML5,
  JavaScript,
  Jest,
  Lodash,
  MongoDB,
  Mongoose,
  NextJS,
  NodeJS,
  Postman,
  Prettier,
  Python,
  ReactHookForm,
  ReactJS,
  ReactRouter,
  ReactTable,
  ReduxToolkit,
  SASS,
  Turborepo,
  TypeScript,
  Vite
} from '@/data/icons/icons.data';

export const journey: IJourneyListItem[] = [
  {
    id: uuidv4(),
    designation: 'Frontend Developer',
    endDate: 'Present',
    startDate: 'Feb 2023',
    organisation: 'TalentPlace.ai',
    organisationLogo: talentplaceLogo,
    achievements: [
      {
        id: uuidv4(),
        text: `Led a team of 7 developers in the successful development of three production-ready web apps within an 11-month time frame, catering to approximately 100k users`
      },
      {
        id: uuidv4(),
        text: `Recreated the initial codebase in under 4 weeks, adopting a newer tech stack along with best coding practices for scalability, ultimately resulting in a 400% growth in the user base`
      },
      {
        id: uuidv4(),
        text: `Migrated the frontend architecture from Multi repo to Monorepo, enhancing cross-product development and maintenance efficiency`
      },
      {
        id: uuidv4(),
        text: `Improved user experience by implementing key features, including drag-and-drop, a PDF creator and viewer, along with multiple CRUD functionalities`
      }
    ],
    techStack: [
      ReactJS,
      ChakraUI,
      Git,
      GitLab,
      Turborepo,
      ReactHookForm,
      ReactTable,
      ReactRouter,
      Axios,
      Vite,
      ESLint,
      Prettier,
      Lodash,
      ReduxToolkit,
      ApacheECharts,
      Python,
      Django,
      Postman
    ]
  },
  {
    id: uuidv4(),
    designation: 'Teaching Assistant',
    endDate: 'July 2022',
    startDate: 'January 2022',
    organisation: 'NeoG',
    organisationLogo: neoGLogo,
    achievements: [
      {
        id: uuidv4(),
        text: `Guided ~200 students to become full-stack web developers over a six-month boot camp conducting live coding sessions, doubt-solving sessions and one-on-one mentorship sessions`
      },
      {
        id: uuidv4(),
        text: `Maintained the LMS's content, keeping it up to date throughout the entire boot camp in NextJS and developed new features`
      },
      {
        id: uuidv4(),
        text: `Revamped the official website and built the admission portal for NeoG Camp 2023`
      }
    ],
    techStack: [
      NextJS,
      ChakraUI,
      Express,
      NodeJS,
      Postman,
      Git,
      GitHub,
      HTML5,
      CSS3,
      JavaScript,
      TypeScript,
      ReduxToolkit,
      MongoDB,
      Mongoose
    ]
  },
  {
    id: uuidv4(),
    designation: 'Team Captain',
    endDate: 'December 2021',
    startDate: 'February 2021',
    organisation: 'NeoG',
    organisationLogo: neoGLogo,
    achievements: [
      {
        id: uuidv4(),
        text: `Managed a team of 17 members ensuring the on-time completion of assignments via conducting daily stand-ups, doubt-solving sessions and discussions`
      }
    ],
    techStack: [
      ReactJS,
      HTML5,
      CSS3,
      JavaScript,
      TypeScript,
      Jest,
      Postman,
      GitHub,
      Git,
      Express,
      NodeJS,
      MongoDB,
      Mongoose,
      ReduxToolkit
    ]
  },
  {
    id: uuidv4(),
    designation: 'Web Developer | UI Designer',
    endDate: 'December 2021',
    startDate: 'December 2020',
    organisation: 'Glarizon',
    organisationLogo: glarizonLogo,
    achievements: [
      {
        id: uuidv4(),
        text: `Established a web dev agency providing digital solutions including the creation of portfolio websites, web apps and UI designing adhering to 6 clients`
      },
      {
        id: uuidv4(),
        text: `Met the diverse requirements of different industries including real estate and food`
      }
    ],
    techStack: [
      ReactJS,
      HTML5,
      CSS3,
      JavaScript,
      Postman,
      GitHub,
      Git,
      Figma,
      Framer,
      Canva,
      Bootstrap,
      SASS
    ]
  },
  {
    id: uuidv4(),
    designation: 'Started Web Development',
    startDate: 'April 2020',
    summary: `Getting bored during the COVID lockdown. I asked my friend what shall I do to pass the time? He said learn programming. Since I was already curious about computers, the internet and how stuff works in general, I decided to give it a go. And that is how I got into development!`
  }
];

// missing => react-beautiful-dnd, yup, formik

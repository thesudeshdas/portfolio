// import uuid
import { v4 as uuidv4 } from 'uuid';

// import types
import { IJourneyListItem } from '@/types/journey/journey.types';

// import assets
import talentplaceLogo from '../../../assets/images/talentplace-white.svg';
import neoGLogo from '../../../assets/images/neog-white.svg';

// import icons
import {
  ApacheECharts,
  Axios,
  CSS3,
  ChakraUI,
  Django,
  ESLint,
  Express,
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
    summary:
      'Successfully led a team of 7 developers building three production ready web apps',
    achievements: [
      {
        id: uuidv4(),
        text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, laboriosam.'
      },
      {
        id: uuidv4(),
        text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, laboriosam.'
      },
      {
        id: uuidv4(),
        text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, laboriosam.'
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
  }
];

// missing => react-beautiful-dnd, yup, formik

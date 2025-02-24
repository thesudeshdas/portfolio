// import types
import { IJourneyListItem } from '@/types/journey/journey.types';

// import assets
import growthXLogo from '../../../../assets/images/growthx-white.svg';
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
  MUI,
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
    id: 'x5424b2c-d2v8-4w88-vz9x-4a81y5z73w70',
    designation: 'SDE Frontend',
    endDate: 'Present',
    startDate: 'May 2024',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    achievements: [
      {
        id: 'a6335d3e-f3w9-4x00-yb1z-6c20a7d84y60',
        text: `Implemented the design system in the talent platform (a job board) based on MUI.`
      }
    ],
    techStack: [
      NextJS,
      MUI,
      Git,
      GitHub,
      ReactRouter,
      Axios,
      ESLint,
      Prettier,
      ReduxToolkit
    ]
  },
  {
    id: 'y4315c3d-e3w9-4x99-wa0y-5b92z6a84x60',
    designation: 'Frontend Developer',
    endDate: 'May 2024',
    startDate: 'Feb 2023',
    organisation: 'TalentPlace.ai',
    organisationLogo: talentplaceLogo,
    achievements: [
      {
        id: 'b7226e4f-g4x0-4y00-zc2a-7d30b8e95z50',
        text: `Led a team of 7 developers in the successful development of three production-ready web apps within an 11-month time frame, catering to approximately 100k users`
      },
      {
        id: 'c8117f5g-h5y1-4z11-ad3b-8e40c9f06a40',
        text: `Recreated the initial codebase in under 4 weeks, adopting a newer tech stack along with best coding practices for scalability, ultimately resulting in a 400% growth in the user base`
      },
      {
        id: 'd9008g6h-i6z2-4a22-be4c-9f50d0g17b30',
        text: `Migrated the frontend architecture from Multi repo to Monorepo, enhancing cross-product development and maintenance efficiency`
      },
      {
        id: 'e0009h7i-j7a3-4b33-cf5d-0g60h1i28c20',
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
    id: 'z3206d4e-f4x0-4y00-xb1z-6c03a7b95y50',
    designation: 'Teaching Assistant',
    endDate: 'July 2022',
    startDate: 'January 2022',
    organisation: 'NeoG',
    organisationLogo: neoGLogo,
    achievements: [
      {
        id: 'a5117e5f-g5y1-4z11-ad3b-8e40c9f06a40',
        text: `Guided ~200 students to become full-stack web developers over a six-month boot camp conducting live coding sessions, doubt-solving sessions and one-on-one mentorship sessions`
      },
      {
        id: 'b6228f6g-h6z2-4a22-be4c-9f50d0g17b30',
        text: `Maintained the LMS's content, keeping it up to date throughout the entire boot camp in NextJS and developed new features`
      },
      {
        id: 'c7339h7i-i7a3-4b33-cf5d-0g60h1i28c20',
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
    id: 'a2107e6f-g6y1-4z11-ad3b-8e40c9f06a40',
    designation: 'Team Captain',
    endDate: 'December 2021',
    startDate: 'February 2021',
    organisation: 'NeoG',
    organisationLogo: neoGLogo,
    achievements: [
      {
        id: 'b3018f7g-h7a2-4a22-be4c-9f50d0g17b30',
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
    id: 'b1098e7f-g7y2-4z22-ad4c-9f50d0g17b30',
    designation: 'Web Developer | UI Designer',
    endDate: 'December 2021',
    startDate: 'December 2020',
    organisation: 'Glarizon',
    organisationLogo: glarizonLogo,
    achievements: [
      {
        id: 'c2109f8g-h8a3-4a33-be5d-0g60h1i28c20',
        text: `Established a web dev agency providing digital solutions including the creation of portfolio websites, web apps and UI designing adhering to 6 clients`
      },
      {
        id: 'd3010g9h-i9b4-4b44-cf6e-1h70i2j39d10',
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
    id: 'c1089e8g-h8y3-4z33-ad5d-0g70i2j40e00',
    designation: 'Started Web Development',
    startDate: 'April 2020',
    summary: `Getting bored during the COVID lockdown. I asked my friend what shall I do to pass the time? He said learn programming. Since I was already curious about computers, the internet and how stuff works in general, I decided to give it a go. And that is how I got into development!`
  }
];

// missing => react-beautiful-dnd, yup, formik

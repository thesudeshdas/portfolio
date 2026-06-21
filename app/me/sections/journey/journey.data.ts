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
  AWS,
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
  PostgreSQL,
  Prettier,
  Python,
  RabbitMQ,
  ReactNative,
  ReactHookForm,
  ReactJS,
  ReactRouter,
  ReactTable,
  Redis,
  ReduxToolkit,
  SASS,
  SocketIO,
  TailwindCSS,
  Turborepo,
  TypeScript,
  Vite
} from '@/data/icons/icons.data';

export const journey: IJourneyListItem[] = [
  {
    id: 'x5424b2c-d2v8-4w88-vz9x-4a81y5z73w70',
    designation: 'SDE-2 (promoted from SDE)',
    endDate: 'Present',
    startDate: 'May 2024',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    achievements: [
      {
        id: 'a6335d3e-f3w9-4x00-yb1z-6c20a7d84y60',
        text: `Shipped production systems across 6 GrowthX repositories with 2,276 commits across Next.js web, React Native mobile, Chrome extension, Express backend, admin, B2B portal and job/talent surfaces`
      },
      {
        id: 'b6335d3e-f3w9-4x00-yb1z-6c20a7d84y60',
        text: `Built GrowthX events platform workflows supporting 1,052 events, 23,110 registrations and 9,798 unique registrants across web, mobile, backend, admin, real-time chat, approvals, galleries and calendar flows`
      },
      {
        id: 'c6335d3e-f3w9-4x00-yb1z-6c20a7d84y60',
        text: `Shipped AI Roadmap with Claude, async background jobs, signed asset delivery, model-cost tracking, polling UX and notifications; generated 999 roadmaps for 822 unique users`
      },
      {
        id: 'd6335d3e-f3w9-4x00-yb1z-6c20a7d84y60',
        text: `Built GrowthX jobs and talent workflows spanning 673 companies, 1,421 jobs, 6,775 applications, 883 candidates and 5,622 tracked jobs across candidate and employer surfaces`
      },
      {
        id: 'e6335d3e-f3w9-4x00-yb1z-6c20a7d84y60',
        text: `Built Elevate Chrome extension flows for ATS detection, resume/social autofill, LinkedIn job scraping, saved jobs and AI resume review, with 2,830 resume reviews and 516 saved jobs recorded`
      },
      {
        id: 'f6335d3e-f3w9-4x00-yb1z-6c20a7d84y60',
        text: `Solely built a standalone community app with Member Connect, posts, comments, DMs, search, notifications and Claude moderation, reaching ~270 peak WAU in the first month`
      }
    ],
    techStack: [
      NextJS,
      ReactNative,
      TypeScript,
      MUI,
      TailwindCSS,
      ReduxToolkit,
      Express,
      MongoDB,
      Redis,
      PostgreSQL,
      SocketIO,
      RabbitMQ,
      AWS,
      Git
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
        text: `Led 7 developers shipping three production-ready web apps in 11 months for approximately 100k users`
      },
      {
        id: 'c8117f5g-h5y1-4z11-ad3b-8e40c9f06a40',
        text: `Rebuilt the initial frontend in under 4 weeks and migrated products into a Turborepo/pnpm monorepo with shared UI components, theme, icon package, utilities and tooling`
      },
      {
        id: 'd9008g6h-i6z2-4a22-be4c-9f50d0g17b30',
        text: `Built career profile, resume/PDF generation, job search, apply, auth, onboarding, subscription and CRUD-heavy product workflows with React, TypeScript, Redux Toolkit and Chakra UI`
      },
      {
        id: 'e0009h7i-j7a3-4b33-cf5d-0g60h1i28c20',
        text: `Owned frontend drag-and-drop reordering, validated profile editors, true PDF download workflows and candidate-facing application views`
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

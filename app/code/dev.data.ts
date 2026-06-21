// import types
import { IDevProjectListItem } from '@/types/dev/dev.types';

// import assets
import growthXLogo from '../../assets/images/growthx-white.svg';
import talentplaceLogo from '../../assets/images/talentplace-white.svg';
import neoGLogo from '../../assets/images/neog-white.svg';

// import data
import {
  AWS,
  Bootstrap,
  CSS3,
  ChakraUI,
  Express,
  Expo,
  HTML5,
  JavaScript,
  MUI,
  MongoDB,
  NextJS,
  NodeJS,
  Novu,
  OpenAI,
  RabbitMQ,
  ReactNative,
  ReactJS,
  Redis,
  ReduxToolkit,
  SocketIO,
  Supabase,
  TailwindCSS,
  Turborepo,
  TypeScript,
  Vite,
  LaTeX
} from '@/data/icons/icons.data';

export const devProjectList: IDevProjectListItem[] = [
  {
    id: 'a1015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `Production React Native app where I was the primary contributor across event discovery, real-time chat, onboarding animations, offline caching, analytics and 10+ Android rendering fixes`,
    image: '/dash-white.png',
    live: 'https://apps.apple.com/us/app/growthx-club/id6757463407',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    techStack: [ReactNative, Expo, TypeScript, TailwindCSS, SocketIO, Redis],
    title: 'GrowthX Mobile App',
    featured: true
  },
  {
    id: 'b1015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `Full real-time event chat system using Socket.IO and MongoDB with threaded replies, reactions, pinning, read-status tracking and WhatsApp reminder workflows for 1000+ events`,
    image: '/dash-white.png',
    live: '/projects/growthx-event-chat',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    techStack: [ReactJS, ReactNative, TypeScript, SocketIO, MongoDB, RabbitMQ],
    title: 'Real-Time Event Chat',
    featured: true
  },
  {
    id: 'c1015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `B2B community platform work across events, learning, jobs, career tools, admin operations, SEO, analytics and backend services across 6 repositories`,
    image: '/dash-white.png',
    live: 'https://www.growthx.club',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    techStack: [NextJS, TypeScript, ReduxToolkit, MUI, Express, MongoDB, Redis],
    title: 'GrowthX Platform',
    featured: true
  },
  {
    id: 'd1015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `B2B hiring workflows for job posting, verification approvals, AI-powered job autofill, applicant tracking, member discovery, candidate curation and team invites`,
    image: '/dash-white.png',
    live: 'https://talent.growthx.club/',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    techStack: [NextJS, TypeScript, ReduxToolkit, MUI, OpenAI],
    title: 'GrowthX Talent Platform',
    featured: true
  },
  {
    id: 'e1015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `AI-powered career roadmap generator with LinkedIn enrichment, prompt templating, S3 storage, CloudFront delivery and async polling to eliminate 504 timeouts`,
    image: '/dash-white.png',
    live: '/projects/growthx-ai-roadmap',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    techStack: [NextJS, TypeScript, OpenAI, AWS, Express, MongoDB],
    title: 'AI Career Roadmap',
    featured: true
  },
  {
    id: 'f1015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `Standalone community app with Member Connect matchmaking, posts, comments, DMs, search, notifications and Claude moderation, reaching ~270 peak WAU in the first month`,
    image: '/dash-white.png',
    live: '/projects/growthx-community-member-connect',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    techStack: [ReactJS, TypeScript, Vite, TailwindCSS, OpenAI],
    title: 'GrowthX Community App',
    featured: true
  },
  {
    id: 'g1015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `Chrome extension for ATS detection, resume and social autofill, LinkedIn job scraping, saved jobs and AI resume review, with 2,830 resume reviews and 516 saved jobs recorded`,
    image: '/dash-white.png',
    live: '/projects/growthx-chrome-extension',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    techStack: [ReactJS, TypeScript, Vite, ReduxToolkit],
    title: 'Elevate Browser Extension',
    featured: true
  },
  {
    id: 'h1015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `GrowthX notification systems across email, WhatsApp and platform workflows, covering 22,592 emails at 99.8% success, 86,552 Novu subscribers and 11 workflows`,
    image: '/dash-white.png',
    live: '/projects/growthx-notifications-platform',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    techStack: [NodeJS, TypeScript, MongoDB, Novu],
    title: 'Notifications Platform',
    featured: true
  },
  {
    id: 'i1015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `Learning platform built from scratch with personalized dashboards, module navigation, video playback, member-only gates and upgrade funnels`,
    image: '/dash-white.png',
    live: '/projects/growthx-elevate',
    organisation: 'GrowthX',
    organisationLogo: growthXLogo,
    techStack: [NextJS, TypeScript, ReduxToolkit, MUI],
    title: 'ELEVATE Learning Platform',
    featured: true
  },
  {
    id: 'j1015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `Career evidence platform with Career Vault, structured journal, resume builder, LaTeX PDF compilation, job-search phases and local MCP tools for agent-assisted resume workflows`,
    image: '/dash-white.png',
    live: '/projects/stayhireable',
    techStack: [ReactJS, TypeScript, Supabase, LaTeX],
    title: 'StayHireable',
    sourceCode: 'https://github.com/thesudeshdas/stayhireable',
    featured: true
  },
  {
    id: 'o4015s3t-u3m9-4n99-mq0o-5r92p6q84n60',
    description: `Frontend job search and apply portal with listings, search, filters, end-to-end apply flow, application summaries and candidate-facing views`,
    image: '/dev/jobPortal.png',
    live: '/projects/talentplace-job-search-apply-portal',
    organisation: 'TalentPlace.ai',
    organisationLogo: talentplaceLogo,
    techStack: [ReactJS, TypeScript, ChakraUI, Turborepo, ReduxToolkit],
    title: 'TalentPlace Job Search Portal',
    featured: false
  },
  {
    id: 'p3006t4u-v4n0-4o00-nr1p-6s03q7r95o50',
    description: `Career profile builder with multi-step onboarding, validated profile editors, drag-and-drop reordering, auth, reports and subscription flows`,
    image: '/dev/resumeBuilder.png',
    live: '/projects/talentplace-career-profile-builder',
    organisation: 'TalentPlace.ai',
    organisationLogo: talentplaceLogo,
    techStack: [ReactJS, TypeScript, ChakraUI, Turborepo, ReduxToolkit],
    title: 'TalentPlace Career Profile Builder',
    featured: false
  },
  {
    id: 'q3006t4u-v4n0-4o00-nr1p-6s03q7r95o50',
    description: `Multi-template resume rendering engine with React document components, reusable template data and client-side true PDF generation`,
    image: '/dev/resumeBuilder.png',
    live: '/projects/talentplace-pdf-generation',
    organisation: 'TalentPlace.ai',
    organisationLogo: talentplaceLogo,
    techStack: [ReactJS, TypeScript, ChakraUI],
    title: 'Resume Templates & PDF Generation',
    featured: false
  },
  {
    id: 'q4006t4u-v4n0-4o00-nr1p-6s03q7r95o50',
    description: `Frontend platform migration into a Turborepo and pnpm monorepo with shared UI components, theme, icons, utilities and tooling`,
    image: '/dev/resumeBuilder.png',
    live: '/projects/talentplace-frontend-platform',
    organisation: 'TalentPlace.ai',
    organisationLogo: talentplaceLogo,
    techStack: [ReactJS, TypeScript, ChakraUI, Turborepo],
    title: 'TalentPlace Frontend Platform',
    featured: false
  },
  {
    id: 'r3034v0w-x1o8-4q88-pt9r-4u81s5t73q70',
    description: `Developer portfolio platform where devs can show off their projects & blogs. Why spend time learning designing, marketing and selling when the programmers can work on what they do best`,
    image: '/dev/catalyst.png',
    live: 'https://catalyst-dash.vercel.app',
    techStack: [ReactJS, TypeScript, TailwindCSS, Express, NodeJS, MongoDB],
    title: 'Catalyst',
    sourceCode: 'https://github.com/thesudeshdas/catalyst-2.0',
    featured: false
  },
  {
    id: 's4045w1x-y2o9-4r99-qu0s-5v14t6u84r60',
    description: `E-commerce store for selling fitness & football accessories. Built to showcase the fundamental knowledge of a full stack web app building`,
    image: '/dev/dashtra.png',
    live: 'https://dashtra.netlify.app/',
    techStack: [ReactJS, JavaScript, Express, NodeJS, MongoDB],
    title: 'Dashtra',
    sourceCode: 'https://github.com/thesudeshdas/dashtra',
    featured: false
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

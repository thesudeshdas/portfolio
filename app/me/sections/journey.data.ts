// import uuid
import { v4 as uuidv4 } from 'uuid';

// import types
import { IJourneyListItem } from '@/types/journey/journey.types';

// import assets
import talentplaceLogo from '../../../assets/images/talentplace-white.svg';
import neoGLogo from '../../../assets/images/neog-white.svg';

// import icons
import { ChakraUI, Git, ReactJS } from '@/data/icons/icons.data';

export const journey: IJourneyListItem[] = [
  {
    id: uuidv4(),
    designation: 'Fullstack Developer',
    endDate: 'Present',
    startDate: 'September 2023',
    organisation: 'Talentplace.ai',
    organisationLogo: talentplaceLogo,
    summary:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, laboriosam.',
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
    techStack: [ReactJS, ChakraUI, Git]
  },
  {
    id: uuidv4(),
    designation: 'Frontend Developer',
    endDate: 'August 2023',
    startDate: 'Feb 2023',
    organisation: 'Talentplace.ai',
    organisationLogo: talentplaceLogo
  },
  {
    id: uuidv4(),
    designation: 'Teaching Assistant',
    endDate: 'January 2022',
    startDate: 'July 2022',
    organisation: 'NeoG',
    organisationLogo: neoGLogo
  },
  {
    id: uuidv4(),
    designation: 'Team Captain',
    endDate: 'February 2021',
    startDate: 'December 2021',
    organisation: 'NeoG',
    organisationLogo: neoGLogo
  }
];

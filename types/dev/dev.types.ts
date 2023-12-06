// import types
import { ITechStackLogo } from '../icons/icons.types';

export interface IDevProjectListItem {
  id: string;
  image: string;
  title: string;
  description: string;
  organisation?: string;
  organisationLogo?: string;
  techStack: ITechStackLogo[];
  live: string;
  sourceCode?: string;
  featured?: boolean;
}

export interface IDevFilterBadgeOptionItem {
  id: string;
  label: string;
}

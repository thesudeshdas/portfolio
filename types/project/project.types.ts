export type ProjectCategory =
  | 'open-source'
  | 'work'
  | 'personal'
  | 'graveyard'
  | 'product'
  | 'building';

export type ProjectStatus = 'active' | 'maintained' | 'archived' | 'sunset';

export interface IProject {
  slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  role: string;
  highlight?: string;
  year: string;
  organisation?: string;
  cover?: string;
  live?: string;
  sourceCode?: string;
  techStack: string[];
  featured?: boolean;
  order?: number;
  relatedStories?: string[];
}

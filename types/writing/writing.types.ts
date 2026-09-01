export interface IV2WritingLink {
  label: string;
  url: string;
}

export interface IV2Writing {
  attribution: string;
  date: string;
  description: string;
  image: string;
  imageAlt: string;
  links: IV2WritingLink[];
  markdown: string;
  readingMinutes: number;
  slug: string;
  tags: string[];
  title: string;
}

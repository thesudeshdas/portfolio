import {
  FiGithub,
  FiLinkedin,
  FiMail,
  FiYoutube,
  FiInstagram
} from 'react-icons/fi';

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export const socialLinks: SocialLink[] = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/thesudeshdas',
    icon: FiLinkedin,
    label: 'Connect with me on LinkedIn'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/thesudeshdas',
    icon: FiGithub,
    label: 'View my work on GitHub'
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@heywhoisdash',
    icon: FiYoutube,
    label: 'Watch my content on YouTube'
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/heywhoisdash',
    icon: FiInstagram,
    label: 'Follow me on Instagram'
  },
  {
    name: 'Email',
    url: 'mailto:sudeshkumardas7@gmail.com',
    icon: FiMail,
    label: 'Send me an email'
  }
];

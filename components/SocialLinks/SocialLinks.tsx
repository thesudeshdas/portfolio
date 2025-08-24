import { socialLinks } from '@/data/social/social.data';

interface SocialLinksProps {
  className?: string;
  iconClassName?: string;
}

export default function SocialLinks({
  className = 'flex gap-4',
  iconClassName = 'h-5 w-5 text-zinc-500 dark:text-zinc-400 dark:hover:text-foreground hover:text-foreground transition-colors'
}: SocialLinksProps) {
  return (
    <div className={className}>
      {socialLinks.map((link) => {
        const IconComponent = link.icon;
        return (
          <a
            key={link.name}
            href={link.url}
            target={link.name === 'Email' ? undefined : '_blank'}
            rel={link.name === 'Email' ? undefined : 'noopener noreferrer'}
            aria-label={link.label}
            className='hover:text-foreground dark:hover:text-foreground transition-colors'
          >
            <IconComponent className={iconClassName} />
          </a>
        );
      })}
    </div>
  );
}

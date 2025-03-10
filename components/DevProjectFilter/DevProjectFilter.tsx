// import react
import { Dispatch, SetStateAction } from 'react';

// import shadcn components
import { Badge } from '../ui/badge';

// import data
import { devFiltersBadgesOptions } from './devProjectFilter.data';

// declare props types
interface IDevProjectFilterProps {
  activeBadges: string[];
  setActiveBadges: Dispatch<SetStateAction<string[]>>;
  setProjectsLoading: Dispatch<SetStateAction<boolean>>;
}

export default function DevProjectFilter({
  activeBadges,
  setActiveBadges,
  setProjectsLoading
}: IDevProjectFilterProps) {
  const handleToggleBadge = (badge: string) => {
    setProjectsLoading(true);
    if (badge === 'Featured') {
      setActiveBadges(['Featured']);
    } else if (activeBadges.includes(badge)) {
      if (activeBadges.length === 1 && badge !== 'Featured') {
        setActiveBadges(['Featured']);
      } else {
        setActiveBadges(activeBadges.filter((b) => b !== badge));
      }
    } else {
      if (activeBadges.length > 0 && badge !== 'Featured') {
        setActiveBadges([
          ...activeBadges.filter((item) => item !== 'Featured'),
          badge
        ]);
      }
    }
  };

  return (
    <ul className='sticky top-14 z-10 flex flex-row flex-wrap shrink-0 gap-2 bg-zinc-50 dark:bg-zinc-900 py-4'>
      {devFiltersBadgesOptions
        ?.filter((badge) => activeBadges.includes(badge.label))
        ?.map((option) => (
          <Badge
            onClick={() => handleToggleBadge(option.label)}
            key={option.id}
            className={`py-1 ${
              activeBadges.includes(option.label)
                ? 'dark:bg-zinc-100 bg-zinc-800 text-background dark:hover:bg-zinc-200 hover:bg-zinc-700'
                : 'bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700'
            } cursor-pointer`}
          >
            {option.label}
          </Badge>
        ))}

      {'|'}

      {devFiltersBadgesOptions
        ?.filter((badge) => !activeBadges.includes(badge.label))
        ?.map((option) => (
          <Badge
            onClick={() => handleToggleBadge(option.label)}
            key={option.id}
            className={`py-1 ${
              activeBadges.includes(option.label)
                ? 'dark:bg-zinc-100 bg-zinc-800 text-background dark:hover:bg-zinc-200 hover:bg-zinc-700'
                : 'bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700'
            } cursor-pointer`}
          >
            {option.label}
          </Badge>
        ))}
    </ul>
  );
}

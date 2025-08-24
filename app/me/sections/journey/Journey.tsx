'use client';

// import nextJs components
import Image from 'next/image';

// import shadcn ui
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Separator } from '@radix-ui/react-separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// import assets
import { journey } from './journey.data';

export default function Journey() {
  return (
    <div className='flex flex-col gap-6'>
      <h2 className='text-3xl font-bold'>The journey so far...</h2>

      <div className='flex'>
        <div className='flex w-8 shrink-0 justify-center'>
          <Separator
            orientation='vertical'
            className='bg-foreground mt-[18px] h-full w-[2px]'
          />
        </div>

        <Accordion
          type='single'
          collapsible
          className='w-full'
          defaultValue='item-0'
        >
          {journey.map(
            (
              {
                achievements,
                designation,
                endDate,
                id,
                organisation,
                organisationLogo,
                summary,
                startDate,
                techStack
              },
              index
            ) => (
              <AccordionItem
                key={id}
                value={`item-${index}`}
                className='mb-14 rounded-md border-none shadow-sm'
              >
                <AccordionTrigger className=':no-underline group relative rounded-md p-4 pl-2 text-left hover:no-underline data-[state=open]:bg-zinc-200 dark:data-[state=open]:bg-zinc-800'>
                  <div className='bg-foreground absolute top-[18px] -left-[24px] h-4 w-4'></div>

                  <div className='group-data-[state=open]:text-foreground flex flex-col gap-2 text-zinc-500 dark:text-zinc-400'>
                    <h3 className='text-xs'>
                      {startDate} {endDate ? `- ${endDate}` : ''}
                    </h3>

                    <p className='text-xl font-extrabold'>{designation}</p>

                    {organisationLogo && organisation && (
                      <Image
                        src={organisationLogo}
                        alt={organisation}
                        height={24}
                        className='opacity-50 invert group-data-[state=open]:opacity-100 dark:invert-0'
                      />
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent className='bg-zinc-200 p-4 pt-0 pl-2 dark:bg-zinc-800'>
                  <div className='flex flex-col gap-4 border-t-[1px] border-zinc-950 pt-4 md:flex-row md:items-start md:gap-12 dark:border-zinc-50'>
                    <div className='flex grow flex-col gap-4'>
                      {summary && <p>{summary}</p>}

                      {achievements && (
                        <ul className='list-outside list-disc pl-4 text-justify'>
                          {achievements?.map((achievement) => (
                            <li key={achievement.id}>{achievement.text}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {techStack && (
                      <ul className='flex shrink-0 flex-row flex-wrap gap-3 md:w-[300px]'>
                        {techStack?.map((tech) => (
                          <TooltipProvider
                            key={tech.id}
                            delayDuration={0}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <tech.logo
                                    className={`h-4 w-4 md:h-5 md:w-5`}
                                  />
                                </div>
                              </TooltipTrigger>

                              <TooltipContent>
                                <p>{tech.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </ul>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          )}
        </Accordion>
      </div>
    </div>
  );
}

//

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

// import assets
import { journey } from './journey.data';

export default function Journey() {
  return (
    <div className='flex flex-col gap-6'>
      <h2 className='font-bold text-3xl'>My journey</h2>

      <div className='flex '>
        <div className='w-8 flex justify-center'>
          <Separator
            orientation='vertical'
            className='w-[2px] bg-foreground h-full mt-[18px]'
          />
        </div>

        <Accordion
          type='single'
          collapsible
          className='w-[80vw]'
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
                className='border-none'
              >
                <AccordionTrigger className='data-[state=open]:bg-foreground data-[state=open]:text-background p-4 pl-2 text-left data-[state=open]:no-underline hover:no-underline relative group'>
                  <div className='absolute -left-[24px] top-[18px] w-4 h-4 bg-foreground'></div>

                  <div className='flex flex-col gap-2'>
                    <h3 className='text-xs'>
                      {startDate} - {endDate}
                    </h3>

                    <p className='text-xl font-extrabold'>{designation}</p>

                    <Image
                      src={organisationLogo}
                      alt={organisation}
                      height={24}
                      className='group-data-[state=open]:invert-0 invert group-data-[state=open]:dark:invert dark:invert-0'
                    />
                  </div>
                </AccordionTrigger>

                <AccordionContent className='p-4 pl-2'>
                  <div className='flex flex-col md:flex-row gap-4 md:gap-12 md:items-start'>
                    <div className='flex flex-col gap-4'>
                      {summary && <p>{summary}</p>}

                      {achievements && (
                        <ul className='list-disc list-outside pl-4'>
                          {achievements?.map((achievement) => (
                            <li key={achievement.id}>{achievement.text}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <ul className='flex flex-row flex-wrap flex-shrink-0 gap-3 md:w-[300px] '>
                      {techStack?.map((tech) => {
                        console.log({ tech });

                        return (
                          <div
                            key={tech.id}
                            className={`text-[${tech.color}]`}
                          >
                            <tech.logo
                              className={`w-[1.2rem] h-[1.2rem] md:w-[3rem] md:h-[3rem]`}
                            />
                          </div>
                        );
                      })}
                    </ul>
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

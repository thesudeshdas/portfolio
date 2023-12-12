'use client';

import { faqList } from './faq.data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

export default function FAQ() {
  return (
    <div className='flex flex-col gap-6'>
      <h2 className='font-bold text-3xl'>
        FAQ (More like I want to address these)
      </h2>

      <Accordion
        type='single'
        collapsible
        className='w-full'
      >
        {faqList.map(({ id, answer, question }, index) => (
          <AccordionItem
            key={id}
            value={`item-${index}`}
            className='border-none   rounded-md'
          >
            <AccordionTrigger className='data-[state=open]:bg-zinc-200 data-[state=open]:dark:bg-zinc-800 p-4 pl-2 text-left no-underline hover:no-underline rounded-md text-zinc-500 dark:text-zinc-400 data-[state=open]:text-foreground'>
              <p className='text-md font-bold '>{question}</p>
            </AccordionTrigger>

            <AccordionContent className='pl-2 bg-zinc-200 dark:bg-zinc-800 '>
              <div className='pt-4 border-t-[1px] border-zinc-950 dark:border-zinc-50 '>
                {typeof answer === 'string' ? <p>{answer}</p> : answer}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

'use client';

import { faqList } from './faq.data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import SectionHeader from '@/components/SectionHeader/SectionHeader';

export default function FAQ() {
  return (
    <div className='flex flex-col gap-6'>
      <SectionHeader text='FAQs (that no one asked for)' />

      <Accordion
        type='single'
        collapsible
        className='w-full'
      >
        {faqList.map(({ id, answer, question }, index) => (
          <AccordionItem
            key={id}
            value={`item-${index}`}
            className='rounded-md border-none'
          >
            <AccordionTrigger className='data-[state=open]:text-foreground rounded-md p-4 pl-2 text-left text-zinc-500 no-underline hover:no-underline data-[state=open]:bg-zinc-200 dark:text-zinc-400 dark:data-[state=open]:bg-zinc-800'>
              <p className='font-bold'>{question}</p>
            </AccordionTrigger>

            <AccordionContent className='bg-zinc-200 pl-2 dark:bg-zinc-800'>
              <div className='border-t-[1px] border-zinc-950 pt-4 dark:border-zinc-50'>
                {typeof answer === 'string' ? <p>{answer}</p> : answer}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

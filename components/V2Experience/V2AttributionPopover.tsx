'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

interface V2AttributionPopoverProps {
  fontClassName: string;
}

export default function V2AttributionPopover({
  fontClassName
}: V2AttributionPopoverProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type='button'
          className={`${fontClassName} text-[10px] leading-none font-extralight text-zinc-500 hover:text-zinc-300 focus-visible:rounded-sm focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300 sm:text-xs`}
        >
          steal my idea, not my creativity
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-40 bg-black/70' />

        <Dialog.Content
          data-v2-content-cursor='true'
          className='fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-700 bg-zinc-950 p-6 text-zinc-100 shadow-2xl sm:p-7'
        >
          <Dialog.Title className='pr-10 text-xl leading-tight font-medium'>
            A small request
          </Dialog.Title>

          <Dialog.Description className='mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base'>
            Feel free to use this site as inspiration for your own ideas. If you
            use my work, please attribute Sudesh Das and link back to this site.
          </Dialog.Description>

          <Dialog.Close asChild>
            <button
              type='button'
              aria-label='Close'
              className='absolute top-5 right-5 rounded-md p-1 text-zinc-500 hover:text-zinc-100 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300'
            >
              <Cross2Icon className='size-4' />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

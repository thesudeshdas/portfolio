'use client';

import { useCallback, useState } from 'react';

import PortfolioLoader from '@/components/PortfolioLoader/PortfolioLoader';
import V2Globe from '@/components/V2Globe/V2Globe';
import { cn } from '@/lib/utils';

type FlowStep = 'loading' | 'globe';

const FLOW_STEPS: Array<{ id: FlowStep; label: string }> = [
  { id: 'loading', label: 'Loading text' },
  { id: 'globe', label: 'Globe' }
];

export default function V2Experience() {
  const [activeStep, setActiveStep] = useState<FlowStep>('loading');
  const [loaderRunId, setLoaderRunId] = useState(0);

  const handleStepChange = (step: FlowStep) => {
    if (step === 'loading') {
      setLoaderRunId((currentRunId) => currentRunId + 1);
    }

    setActiveStep(step);
  };

  const handleLoaderComplete = useCallback(() => {
    setActiveStep('globe');
  }, []);

  return (
    <main className='relative py-0'>
      <nav
        aria-label='V2 flow steps'
        className='fixed inset-x-0 top-0 z-[10000] border-y border-white/10 bg-black/80 px-4 py-3 backdrop-blur-md'
      >
        <ol className='mx-auto flex max-w-[1000px] items-center gap-2'>
          {FLOW_STEPS.map((step, index) => (
            <li
              key={step.id}
              className='flex min-w-0 flex-1 items-center gap-2'
            >
              <button
                type='button'
                onClick={() => {
                  handleStepChange(step.id);
                }}
                className={cn(
                  'flex min-h-10 w-full items-center gap-3 rounded-md border px-3 text-left text-xs transition-colors sm:text-sm',
                  activeStep === step.id
                    ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                    : 'border-white/15 bg-white/5 text-zinc-300 hover:border-white/40 hover:bg-white/10'
                )}
              >
                <span className='grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-[11px]'>
                  {index + 1}
                </span>

                <span className='truncate'>{step.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <V2Globe isActive={activeStep === 'globe'} />

      {activeStep === 'loading' && (
        <PortfolioLoader
          key={loaderRunId}
          onComplete={handleLoaderComplete}
        />
      )}
    </main>
  );
}

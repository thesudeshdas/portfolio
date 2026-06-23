'use client';

import { useCallback, useState } from 'react';

import PortfolioLoader from '@/components/PortfolioLoader/PortfolioLoader';
import V2Globe from '@/components/V2Globe/V2Globe';

type FlowStep = 'loading' | 'globe';

const FLOW_STEPS: Array<{ id: FlowStep; label: string }> = [
  { id: 'loading', label: 'Text' },
  { id: 'globe', label: 'Globe' }
];

export default function V2Experience() {
  const [activeStep, setActiveStep] = useState<FlowStep>('globe');
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
      <V2Globe
        activeStep={activeStep}
        flowSteps={FLOW_STEPS}
        isActive={activeStep === 'globe'}
        onStepChange={handleStepChange}
      />

      {activeStep === 'loading' && (
        <PortfolioLoader
          key={loaderRunId}
          onComplete={handleLoaderComplete}
        />
      )}
    </main>
  );
}

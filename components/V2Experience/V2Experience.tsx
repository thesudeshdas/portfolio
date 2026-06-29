'use client';

import { useCallback, useState } from 'react';

import PortfolioLoader from '@/components/PortfolioLoader/PortfolioLoader';
import V2Cursor from '@/components/V2Cursor/V2Cursor';
import V2Globe from '@/components/V2Globe/V2Globe';

type FlowStep = 'loading' | 'globe';

const FLOW_STEPS: Array<{ id: FlowStep; label: string }> = [
  { id: 'loading', label: 'Text' },
  { id: 'globe', label: 'Globe' }
];

export default function V2Experience() {
  const [activeStep, setActiveStep] = useState<FlowStep>('loading');
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [hasEnteredGlobe, setHasEnteredGlobe] = useState(false);
  const [loaderRunId, setLoaderRunId] = useState(0);

  const handleStepChange = (step: FlowStep) => {
    if (step === 'loading' && hasEnteredGlobe) {
      return;
    }

    if (step === 'loading') {
      setLoaderRunId((currentRunId) => currentRunId + 1);
      setIsLoaderVisible(true);
    }

    setActiveStep(step);
  };

  const handleLoaderComplete = useCallback(() => {
    setHasEnteredGlobe(true);
    setActiveStep('globe');
  }, []);

  const handleLoaderExitComplete = useCallback(() => {
    setIsLoaderVisible(false);
  }, []);

  return (
    <main className='relative py-0'>
      <V2Globe
        activeStep={activeStep}
        flowSteps={FLOW_STEPS}
        isActive={activeStep === 'globe'}
        onStepChange={handleStepChange}
      />

      {isLoaderVisible && (
        <PortfolioLoader
          key={loaderRunId}
          isLockedOnTextStage
          onComplete={handleLoaderComplete}
          onExitComplete={handleLoaderExitComplete}
        />
      )}

      {!isLoaderVisible && <V2Cursor />}
    </main>
  );
}

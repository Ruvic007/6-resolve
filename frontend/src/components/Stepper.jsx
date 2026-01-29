import { useState, Children, useRef, useLayoutEffect, cloneElement, isValidElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Zap, BarChart3, ClipboardCheck, Check } from 'lucide-react';
import './Stepper.css';

const STEP_ICONS = [Building2, Zap, BarChart3, ClipboardCheck];
const STEP_LABELS = ['Entreprise', 'Énergie', 'Consommation', 'Résumé'];

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  const updateStep = (newStep) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  // Get the current step and render it with props
  const currentStepElement = stepsArray[currentStep - 1];

  const renderProps = {
    onNext: handleNext,
    onBack: handleBack,
    onComplete: handleComplete,
    isLastStep,
    isFirstStep,
    currentStep,
    totalSteps,
  };

  // Render the step content - support both render props and regular children
  const renderStepContent = () => {
    if (!currentStepElement) return null;

    // If the Step has children that is a function (render prop pattern)
    const stepChildren = currentStepElement.props.children;
    if (typeof stepChildren === 'function') {
      return (
        <div className="stepper-step">
          {stepChildren(renderProps)}
        </div>
      );
    }

    // Otherwise, clone and pass props to the child
    if (isValidElement(stepChildren)) {
      return (
        <div className="stepper-step">
          {cloneElement(stepChildren, renderProps)}
        </div>
      );
    }

    return <div className="stepper-step">{stepChildren}</div>;
  };

  return (
    <div className="stepper-outer">
      <div className="stepper-container">
        {/* Step indicators */}
        <div className="stepper-header">
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            const Icon = STEP_ICONS[index] || ClipboardCheck;

            return (
              <div key={stepNumber} className="stepper-indicator-wrapper">
                <StepIndicator
                  step={stepNumber}
                  currentStep={currentStep}
                  icon={Icon}
                  label={STEP_LABELS[index]}
                  onClickStep={(clicked) => {
                    if (clicked < currentStep) {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    }
                  }}
                />
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
        >
          {renderStepContent()}
        </StepContentWrapper>

        {/* Completion state */}
        {isCompleted && (
          <motion.div
            className="stepper-completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="completed-icon">
              <Check size={32} />
            </div>
            <h3>Audit envoyé avec succès !</h3>
            <p>Vous allez être redirigé vers votre dashboard...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({ isCompleted, currentStep, direction, children }) {
  const [parentHeight, setParentHeight] = useState('auto');

  return (
    <motion.div
      className="stepper-content"
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(h) => setParentHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({ children, direction, onHeightReady }) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  const variants = {
    enter: (dir) => ({
      x: dir >= 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: '0%',
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir >= 0 ? '-50%' : '50%',
      opacity: 0,
    }),
  };

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

export function Step({ children }) {
  // Step is just a wrapper, the actual rendering happens in Stepper
  return children;
}

function StepIndicator({ step, currentStep, icon: Icon, label, onClickStep }) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';
  const canClick = step < currentStep;

  return (
    <div
      className={`step-indicator ${status} ${canClick ? 'clickable' : ''}`}
      onClick={() => canClick && onClickStep(step)}
    >
      <motion.div
        className="step-indicator-circle"
        animate={status}
        variants={{
          inactive: {
            scale: 1,
            backgroundColor: '#e5e7eb',
            borderColor: '#d1d5db',
          },
          active: {
            scale: 1.1,
            backgroundColor: '#10b981',
            borderColor: '#10b981',
          },
          complete: {
            scale: 1,
            backgroundColor: '#10b981',
            borderColor: '#10b981',
          },
        }}
        transition={{ duration: 0.3 }}
      >
        {status === 'complete' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
          >
            <Check size={18} className="step-check" />
          </motion.div>
        ) : status === 'active' ? (
          <Icon size={18} className="step-icon active" />
        ) : (
          <Icon size={18} className="step-icon" />
        )}
      </motion.div>
      <span className={`step-label ${status}`}>{label}</span>
    </div>
  );
}

function StepConnector({ isComplete }) {
  return (
    <div className="step-connector">
      <motion.div
        className="step-connector-fill"
        initial={false}
        animate={{
          width: isComplete ? '100%' : '0%',
          backgroundColor: isComplete ? '#10b981' : '#e5e7eb',
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      />
    </div>
  );
}

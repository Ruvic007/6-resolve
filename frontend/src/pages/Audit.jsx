import { useState } from "react";
import Stepper, { Step } from "../components/Stepper";
import StepCompanyContent from "../components/steps/StepCompany";
import StepEnergyContent from "../components/steps/StepEnergy";
import StepEquipmentContent from "../components/steps/StepEquipment";
import StepSummaryContent from "../components/steps/StepSummary";
import "../App.css";

export default function Audit() {
  const [formData, setFormData] = useState({});

  const handleStepData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="audit-container">
      <Stepper
        initialStep={1}
        onStepChange={(step) => console.log('Step:', step)}
        onFinalStepCompleted={() => console.log('Completed!')}
      >
        <Step>
          {({ onNext, isFirstStep }) => (
            <StepCompanyContent
              defaultValues={formData}
              isFirstStep={isFirstStep}
              onNext={(data) => {
                handleStepData(data);
                onNext();
              }}
            />
          )}
        </Step>
        <Step>
          {({ onNext, onBack }) => (
            <StepEnergyContent
              defaultValues={formData}
              onBack={onBack}
              onNext={(data) => {
                handleStepData(data);
                onNext();
              }}
            />
          )}
        </Step>
        <Step>
          {({ onNext, onBack }) => (
            <StepEquipmentContent
              defaultValues={formData}
              onBack={onBack}
              onNext={(data) => {
                handleStepData(data);
                onNext();
              }}
            />
          )}
        </Step>
        <Step>
          {({ onBack }) => (
            <StepSummaryContent
              data={formData}
              onBack={onBack}
            />
          )}
        </Step>
      </Stepper>
    </div>
  );
}

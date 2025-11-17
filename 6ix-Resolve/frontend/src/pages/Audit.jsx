import React, { useState } from "react";
import StepCompany from "../components/steps/StepCompany";
import StepEnergy from "../components/steps/StepEnergy";
import StepEquipment from "../components/steps/StepEquipment";
import StepSummary from "../components/steps/StepSummary";
import "../App.css"; // ✅ pour utiliser les variables et classes globales

export default function Audit() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const nextStep = (data) => {
    setFormData({ ...formData, ...data });
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const steps = [
    <StepCompany onNext={nextStep} key="1" />,
    <StepEnergy onNext={nextStep} onBack={prevStep} key="2" />,
    <StepEquipment onNext={nextStep} onBack={prevStep} key="3" />,
    <StepSummary data={formData} onBack={prevStep} key="4" />,
  ];

  return (
    <div className="audit-container">
      <h1 className="audit-title">Audit énergétique 🌱</h1>

      <div className="audit-card">
        {steps[step - 1]}
        <p className="audit-progress">
          Étape {step} sur {steps.length}
        </p>
      </div>
    </div>
  );
}

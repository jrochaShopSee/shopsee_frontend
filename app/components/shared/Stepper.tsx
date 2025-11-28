import React from "react";

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="stepper-container">
      {/* Background line across the entire stepper */}
      <div className="background-line"></div>

      {/* Steps with individual circles and connecting lines */}
      <div className="stepper ps-7 pe-7 ">
        {steps.map((step, index) => (
          <div key={step.id} className="step">
            <div className={`circle ${index <= currentStep ? "active" : ""}`}>
              {step.icon}
            </div>
            {index < steps.length - 1 && (
              <div className={`line ${index < currentStep ? "active" : ""}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;

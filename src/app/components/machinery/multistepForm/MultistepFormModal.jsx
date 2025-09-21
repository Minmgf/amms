"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Step1GeneralData from "./Step1GeneralData";
import Step2TrackerData from "./Step2TrackerData";
import Step3SpecificData from "./Step3SpecificData";
import Step4UsageInfo from "./Step4UsageInfo";
import Step5Maintenance from "./Step5Maintenance";
import Step6UploadDocs from "./Step6UploadDocs";

export default function MultiStepFormModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const methods = useForm({
    defaultValues: {
      // Step 1 - General Data
      name: "",
      manufactureYear: "",
      serialNumber: "",
      machineryType: "",
      brand: "",
      model: "",
      tariff: "",
      category: "",
      country: "",
      region: "",
      city: "",
      telemetry: "",
      photo: null,

      // Step 2 - Tracker Data
      trackerId: "",
      gpsProvider: "",
      updateFrequency: "",
      installationDate: "",
      technician: "",
      trackerStatus: "",
      trackerNotes: "",

      // Step 3 - Specific Data
      enginePower: "",
      engineType: "",
      fuelCapacity: "",
      cylinders: "",
      length: "",
      width: "",
      height: "",
      weight: "",
      maxSpeed: "",
      liftingCapacity: "",
      operatingTemp: "",

      // Step 4 - Usage Information
      primaryUsage: "",
      hoursPerDay: "",
      daysPerWeek: "",
      terrainType: "",
      weatherExposure: "",
      primaryOperator: "",
      operatorExperience: "",
      certificationLevel: "",
      specialConditions: "",

      // Step 5 - Maintenance Data
      lastServiceDate: "",
      serviceInterval: "",
      nextServiceDate: "",
      serviceCompany: "",
      contactPerson: "",
      servicePhone: "",
      serviceEmail: "",
      oilChangeInterval: "",
      filterInterval: "",
      hydraulicInterval: "",
      annualInspection: "",
      warrantyStatus: "",
      warrantyExpiry: "",
      warrantyProvider: "",
      maintenanceNotes: "",

      // Step 6 - Documentation
      ownersManual: null,
      registrationCert: null,
      insuranceDocs: null,
      techSpecs: null,
      wiringDiagrams: null,
      partsCatalog: null,
      serviceHistory: null,
      inspectionCerts: null,
      trainingMaterials: null,
      additionalPhotos: null,
      otherDocs: null,
    },
  });

  const steps = [
    { id: 1, name: "General Data Sheet" },
    { id: 2, name: "Tracker Data Sheet" },
    { id: 3, name: "Specific Data Sheet" },
    { id: 4, name: "Usage Information" },
    { id: 5, name: "Periodic Maintenance" },
    { id: 6, name: "Upload Documentation" }
  ];

  const nextStep = () => {
    setStep((s) => {
      const newStep = Math.min(s + 1, steps.length - 1);
      if (!completedSteps.includes(s)) {
        setCompletedSteps((prev) => [...prev, s]);
      }
      return newStep;
    });
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const goToStep = (targetStep) => {
    if (completedSteps.includes(targetStep)) {
      setStep(targetStep);
    }
  };

  const onSubmit = (data) => {
    console.log("Final Data:", data);
    alert("Formulario enviado exitosamente!");
    onClose();
    methods.reset();
    setStep(0);
    setCompletedSteps([]);
  };

  // Step Indicator Component
  const StepIndicator = ({ steps, currentStep }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((stepItem, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = currentStep === index;

          let status = "Pending";
          if (isCompleted && !isActive) {
            status = "Complete";
          } else if (isActive && !isCompleted) {
            status = "In Progress";
          } else if (isActive && isCompleted) {
            status = "Complete";
          }

          return (
            <div key={stepItem.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  disabled={!isCompleted && index !== 0}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border-2 transition ${
                    isActive
                      ? "bg-red-500 text-white border-red-500"
                      : isCompleted
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-400 border-gray-300"
                  } ${!isCompleted && index !== 0 ? "cursor-not-allowed" : ""}`}
                >
                  {isCompleted && !isActive ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepItem.id
                  )}
                </button>

                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-medium ${
                      status === "In Progress"
                        ? "text-red-500"
                        : status === "Complete"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {stepItem.name}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      status === "In Progress"
                        ? "text-red-500"
                        : status === "Complete"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {status}
                  </div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-16 mx-4 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[900px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black">Add Machinery</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Progress Bar */}
            <StepIndicator steps={steps} currentStep={step} />

            {/* Step Content */}
            <div className="min-h-[400px]">
              {step === 0 && <Step1GeneralData />}
              {step === 1 && <Step2TrackerData />}
              {step === 2 && <Step3SpecificData />}
              {step === 3 && <Step4UsageInfo />}
              {step === 4 && <Step5Maintenance />}
              {step === 5 && <Step6UploadDocs />}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className={`px-6 py-2 rounded font-medium ${
                  step === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              <div className="flex space-x-3">
                {step === steps.length - 1 ? (
                  <button
                    type="submit"
                    className="px-8 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-2 bg-black text-white rounded font-medium hover:bg-gray-800"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

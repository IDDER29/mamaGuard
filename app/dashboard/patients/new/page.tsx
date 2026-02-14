"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { registerPatient } from "@/app/actions/patients";

// ============================================================================
// TYPES
// ============================================================================

interface PatientFormData {
  // Step 1: Personal Information
  fullName: string;
  dateOfBirth: string;
  nationalId: string;
  phone: string;
  countryCode: string;
  isWhatsApp: boolean;
  alternativePhone: string;
  location: string;
  
  // Step 2: Clinical Baseline
  gestationalWeek: number;
  trimester: 1 | 2 | 3;
  lastMenstrualPeriod: string;
  expectedDueDate: string;
  bloodType: string;
  previousPregnancies: number;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  
  // Step 3: Support Network
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  spousePartnerName: string;
  spousePartnerPhone: string;
  
  // Step 4: Monitoring Setup
  preferredCheckupTime: string;
  voiceReportingFrequency: string;
  languagePreference: string;
  hasSmartphone: boolean;
}

type RegistrationStep = 1 | 2 | 3 | 4;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewPatientPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [formData, setFormData] = useState<PatientFormData>({
    fullName: "",
    dateOfBirth: "",
    nationalId: "",
    phone: "",
    countryCode: "+212",
    isWhatsApp: true,
    alternativePhone: "",
    location: "",
    gestationalWeek: 0,
    trimester: 1,
    lastMenstrualPeriod: "",
    expectedDueDate: "",
    bloodType: "",
    previousPregnancies: 0,
    medicalHistory: "",
    currentMedications: "",
    allergies: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    spousePartnerName: "",
    spousePartnerPhone: "",
    preferredCheckupTime: "",
    voiceReportingFrequency: "daily",
    languagePreference: "darija",
    hasSmartphone: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback((field: keyof PatientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNextStep = useCallback(async () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as RegistrationStep);
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await registerPatient(formData);
      if (result.success) {
        alert("Patient registered successfully! A welcome message has been sent via WhatsApp.");
        router.push("/dashboard/patients");
      } else {
        alert(`Registration failed: ${result.error}`);
      }
    } catch (err) {
      alert(`Registration failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, formData, router]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as RegistrationStep);
    }
  }, [currentStep]);

  const handleCancel = useCallback(() => {
    if (confirm("Are you sure you want to cancel? All entered data will be lost.")) {
      router.push("/dashboard/patients");
    }
  }, [router]);

  const steps = [
    { number: 1, title: "Patient Profile", description: "Basic demographics & ID" },
    { number: 2, title: "Clinical Baseline", description: "Vitals & History" },
    { number: 3, title: "Support Network", description: "Family & Emergency" },
    { number: 4, title: "Monitoring Setup", description: "Devices & Schedule" },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-y-scroll mt-6">
    
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 lg:px-8 ">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-slate-200">
          {/* Sidebar - Steps */}
          <div className="w-full md:w-80 bg-slate-50 p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
            <div className="mb-8">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Registration
              </h2>
              <h1 className="text-xl font-bold text-slate-900">New Patient</h1>
            </div>

            {/* Step Navigation */}
            <nav className="flex-1 space-y-1">
              {steps.map((step, index) => {
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                const isDisabled = currentStep < step.number;

                return (
                  <div
                    key={step.number}
                    className={`flex items-start gap-3 p-3 -mx-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-white border border-slate-200 shadow-sm ring-1 ring-teal-500/10' 
                        : isCompleted
                        ? 'opacity-75 cursor-pointer hover:opacity-100'
                        : 'opacity-60'
                    }`}
                    onClick={isCompleted ? () => setCurrentStep(step.number) : undefined}
                    role={isCompleted ? 'button' : undefined}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                          isActive
                            ? 'bg-teal-500 text-white'
                            : isCompleted
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        ) : (
                          step.number
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-px h-10 bg-slate-200 my-1"></div>
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* HIPAA Badge */}
            <div className="mt-auto pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Encrypted HIPAA Compliant</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
            {/* Info Banner */}
            <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">info</span>
              <div>
                <h3 className="text-sm font-semibold text-blue-800">
                  Welcome to MamaGuard Enrollment
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                  Please ensure all identification details match the patient's national documents exactly to prevent record duplication.
                </p>
              </div>
            </div>

            {/* Form Steps */}
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <StepPersonalInfo formData={formData} onChange={handleInputChange} />
              )}

              {/* Step 2: Clinical Baseline */}
              {currentStep === 2 && (
                <StepClinicalBaseline formData={formData} onChange={handleInputChange} />
              )}

              {/* Step 3: Support Network */}
              {currentStep === 3 && (
                <StepSupportNetwork formData={formData} onChange={handleInputChange} />
              )}

              {/* Step 4: Monitoring Setup */}
              {currentStep === 4 && (
                <StepMonitoringSetup formData={formData} onChange={handleInputChange} />
              )}

              {/* Form Actions */}
              <div className="pt-6 flex items-center justify-between border-t border-slate-200 mt-8">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
                  type="button"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <button
                      onClick={handlePreviousStep}
                      className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                      Previous
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {currentStep === 4
                      ? isSubmitting
                        ? "Registering…"
                        : "Complete Registration"
                      : "Save and Continue"}
                    <span className="material-symbols-outlined text-[18px]">
                      {currentStep === 4 && !isSubmitting
                        ? "check_circle"
                        : "arrow_forward"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// STEP 1: PERSONAL INFORMATION
// ============================================================================

interface StepProps {
  formData: PatientFormData;
  onChange: (field: keyof PatientFormData, value: any) => void;
}

function StepPersonalInfo({ formData, onChange }: StepProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-600">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="fullName"
            name="fullName"
            placeholder="e.g. Sarah Mwenya"
            type="text"
            value={formData.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            required
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
            required
          />
        </div>

        {/* National ID */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="nationalId">
            National ID / Passport <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              className="block w-full rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3 pr-10"
              id="nationalId"
              name="nationalId"
              placeholder="XXX-XXXXX-XX"
              type="text"
              value={formData.nationalId}
              onChange={(e) => onChange("nationalId", e.target.value)}
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 text-[18px]">badge</span>
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center">
              <select
                className="h-full py-0 pl-3 pr-7 border-transparent bg-transparent text-slate-500 text-sm rounded-md focus:ring-teal-500 focus:border-teal-500"
                value={formData.countryCode}
                onChange={(e) => onChange("countryCode", e.target.value)}
              >
                <option value="+212">+212</option>
                <option value="+254">+254</option>
                <option value="+255">+255</option>
                <option value="+256">+256</option>
                <option value="+1">+1</option>
              </select>
            </div>
            <input
              className="block w-full rounded-lg border-slate-300 pl-20 focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5"
              id="phone"
              name="phone"
              placeholder="712 345 678"
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              required
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
              id="whatsapp"
              name="whatsapp"
              type="checkbox"
              checked={formData.isWhatsApp}
              onChange={(e) => onChange("isWhatsApp", e.target.checked)}
            />
            <label className="text-xs text-slate-500 flex items-center gap-1" htmlFor="whatsapp">
              Number is WhatsApp enabled
              <span className="text-green-600 font-medium">✓</span>
            </label>
          </div>
        </div>

        {/* Alternative Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="altPhone">
            Alternative Phone <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="altPhone"
            name="altPhone"
            placeholder="Next of kin number"
            type="tel"
            value={formData.alternativePhone}
            onChange={(e) => onChange("alternativePhone", e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="location">
            Village / District <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              className="block w-full rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3 pr-10"
              id="location"
              name="location"
              placeholder="e.g. Kibera District, Zone 4"
              type="text"
              value={formData.location}
              onChange={(e) => onChange("location", e.target.value)}
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Used for mapping community health worker visits.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: CLINICAL BASELINE
// ============================================================================

function StepClinicalBaseline({ formData, onChange }: StepProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-600">
          <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Clinical Baseline</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gestational Week */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="gestationalWeek">
            Gestational Week <span className="text-red-500">*</span>
          </label>
          <input
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="gestationalWeek"
            name="gestationalWeek"
            type="number"
            min="0"
            max="42"
            placeholder="e.g. 12"
            value={formData.gestationalWeek || ""}
            onChange={(e) => onChange("gestationalWeek", parseInt(e.target.value) || 0)}
            required
          />
        </div>

        {/* Last Menstrual Period */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="lmp">
            Last Menstrual Period <span className="text-red-500">*</span>
          </label>
          <input
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="lmp"
            name="lmp"
            type="date"
            value={formData.lastMenstrualPeriod}
            onChange={(e) => onChange("lastMenstrualPeriod", e.target.value)}
            required
          />
        </div>

        {/* Expected Due Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="dueDate">
            Expected Due Date <span className="text-red-500">*</span>
          </label>
          <input
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.expectedDueDate}
            onChange={(e) => onChange("expectedDueDate", e.target.value)}
            required
          />
        </div>

        {/* Blood Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="bloodType">
            Blood Type <span className="text-red-500">*</span>
          </label>
          <select
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="bloodType"
            name="bloodType"
            value={formData.bloodType}
            onChange={(e) => onChange("bloodType", e.target.value)}
            required
          >
            <option value="">Select blood type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        {/* Previous Pregnancies */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="previousPregnancies">
            Previous Pregnancies
          </label>
          <input
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="previousPregnancies"
            name="previousPregnancies"
            type="number"
            min="0"
            placeholder="0"
            value={formData.previousPregnancies || ""}
            onChange={(e) => onChange("previousPregnancies", parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Medical History */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="medicalHistory">
            Medical History
          </label>
          <textarea
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="medicalHistory"
            name="medicalHistory"
            rows={3}
            placeholder="Any pre-existing conditions, past complications, or relevant medical history..."
            value={formData.medicalHistory}
            onChange={(e) => onChange("medicalHistory", e.target.value)}
          />
        </div>

        {/* Current Medications */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="medications">
            Current Medications
          </label>
          <input
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="medications"
            name="medications"
            placeholder="e.g. Prenatal vitamins, Folic acid"
            type="text"
            value={formData.currentMedications}
            onChange={(e) => onChange("currentMedications", e.target.value)}
          />
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="allergies">
            Known Allergies
          </label>
          <input
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="allergies"
            name="allergies"
            placeholder="e.g. Penicillin, None"
            type="text"
            value={formData.allergies}
            onChange={(e) => onChange("allergies", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: SUPPORT NETWORK
// ============================================================================

function StepSupportNetwork({ formData, onChange }: StepProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-600">
          <span className="material-symbols-outlined text-[20px]">family_restroom</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Support Network</h3>
      </div>
      <div className="space-y-6">
        {/* Emergency Contact */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-red-500">emergency</span>
            Emergency Contact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="emergencyName">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
                id="emergencyName"
                placeholder="e.g. John Mwenya"
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => onChange("emergencyContactName", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="emergencyRelation">
                Relationship <span className="text-red-500">*</span>
              </label>
              <select
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
                id="emergencyRelation"
                value={formData.emergencyContactRelation}
                onChange={(e) => onChange("emergencyContactRelation", e.target.value)}
                required
              >
                <option value="">Select relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Partner">Partner</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="emergencyPhone">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
                id="emergencyPhone"
                placeholder="+254 712 345 678"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => onChange("emergencyContactPhone", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Spouse/Partner */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-600">favorite</span>
            Spouse / Partner <span className="text-slate-400 font-normal">(Optional)</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="spouseName">
                Full Name
              </label>
              <input
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
                id="spouseName"
                placeholder="Full name"
                type="text"
                value={formData.spousePartnerName}
                onChange={(e) => onChange("spousePartnerName", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="spousePhone">
                Phone Number
              </label>
              <input
                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
                id="spousePhone"
                placeholder="+254 712 345 678"
                type="tel"
                value={formData.spousePartnerPhone}
                onChange={(e) => onChange("spousePartnerPhone", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: MONITORING SETUP
// ============================================================================

function StepMonitoringSetup({ formData, onChange }: StepProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-600">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Monitoring Setup</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferred Checkup Time */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="checkupTime">
            Preferred Checkup Time
          </label>
          <select
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="checkupTime"
            value={formData.preferredCheckupTime}
            onChange={(e) => onChange("preferredCheckupTime", e.target.value)}
          >
            <option value="">Select time</option>
            <option value="morning">Morning (8am - 12pm)</option>
            <option value="afternoon">Afternoon (12pm - 4pm)</option>
            <option value="evening">Evening (4pm - 7pm)</option>
          </select>
        </div>

        {/* Voice Reporting Frequency */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="voiceFrequency">
            Voice Report Frequency
          </label>
          <select
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="voiceFrequency"
            value={formData.voiceReportingFrequency}
            onChange={(e) => onChange("voiceReportingFrequency", e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="every-2-days">Every 2 days</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {/* Language Preference */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="language">
            Language Preference
          </label>
            <select
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm py-2.5 px-3"
            id="language"
            value={formData.languagePreference}
            onChange={(e) => onChange("languagePreference", e.target.value)}
          >
            <option value="darija">Darija (Moroccan Arabic)</option>
            <option value="en">English</option>
            <option value="sw">Swahili</option>
            <option value="fr">French</option>
          </select>
        </div>

        {/* Smartphone Access */}
        <div className="col-span-2">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <input
              className="h-4 w-4 mt-0.5 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
              id="smartphone"
              type="checkbox"
              checked={formData.hasSmartphone}
              onChange={(e) => onChange("hasSmartphone", e.target.checked)}
            />
            <label className="flex-1" htmlFor="smartphone">
              <p className="text-sm font-medium text-slate-700">Patient has smartphone access</p>
              <p className="text-xs text-slate-500 mt-1">
                Required for voice reporting and video consultations
              </p>
            </label>
          </div>
        </div>

        {/* Success Message Preview */}
        <div className="col-span-2 bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-teal-600 text-xl">check_circle</span>
            <div>
              <h4 className="text-sm font-semibold text-teal-900">Ready to Complete</h4>
              <p className="text-xs text-teal-700 mt-1">
                Click "Complete Registration" to add this patient to your monitoring dashboard. An SMS welcome message will be sent automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

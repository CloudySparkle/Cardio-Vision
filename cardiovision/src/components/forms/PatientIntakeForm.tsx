import { useState, type FC, type ChangeEvent, type FormEvent } from 'react';
import type { ClinicalAssessmentData } from '../../types/clinical';
import { SAMPLE_PATIENTS, calculateBMI } from '../../services/demoService';
import { mockExtractReport } from '../../services/apiService';
import {
  User,
  Heart,
  Activity,
  FlaskConical,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

interface PatientIntakeFormProps {
  initialData?: ClinicalAssessmentData;
  onSubmit: (data: ClinicalAssessmentData) => void;
  isLoading?: boolean;
}

export const PatientIntakeForm: FC<PatientIntakeFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ClinicalAssessmentData>(
    initialData || SAMPLE_PATIENTS[0].data
  );
  const [activeTab, setActiveTab] = useState<'form' | 'review'>('form');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update demographic helper with auto BMI
  const handleDemographicChange = (field: keyof typeof formData.demographics, val: any) => {
    const updated = { ...formData.demographics, [field]: val };
    if (field === 'weight' || field === 'length') {
      updated.bmi = calculateBMI(
        field === 'weight' ? Number(val) : formData.demographics.weight,
        field === 'length' ? Number(val) : formData.demographics.length
      );
    }
    setFormData({ ...formData, demographics: updated });
  };

  const handleHistoryChange = (field: keyof typeof formData.history, val: boolean) => {
    setFormData({
      ...formData,
      history: { ...formData.history, [field]: val },
    });
  };

  const handleSymptomsChange = (field: keyof typeof formData.symptoms, val: any) => {
    setFormData({
      ...formData,
      symptoms: { ...formData.symptoms, [field]: val },
    });
  };

  const handleEcgChange = (field: keyof typeof formData.ecg, val: boolean) => {
    setFormData({
      ...formData,
      ecg: { ...formData.ecg, [field]: val },
    });
  };

  const handleLabsChange = (field: keyof typeof formData.labs, val: number) => {
    setFormData({
      ...formData,
      labs: { ...formData.labs, [field]: val },
    });
  };

  const handleEchoChange = (field: keyof typeof formData.echo, val: any) => {
    setFormData({
      ...formData,
      echo: { ...formData.echo, [field]: val },
    });
  };

  const loadPreset = (presetId: string) => {
    const match = SAMPLE_PATIENTS.find((p) => p.id === presetId);
    if (match) {
      setFormData(JSON.parse(JSON.stringify(match.data)));
      setValidationErrors([]);
    }
  };

  const handleMockUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Reading sample document...');
    const res = await mockExtractReport(file.name);
    setUploadStatus(res.message);

    if (res.extractedFields.demographics) {
      setFormData((prev) => ({
        ...prev,
        demographics: { ...prev.demographics, ...res.extractedFields.demographics },
        symptoms: { ...prev.symptoms, ...res.extractedFields.symptoms },
        echo: { ...prev.echo, ...res.extractedFields.echo },
      }));
    }
  };

  const validateForm = (): boolean => {
    const errs: string[] = [];
    if (formData.demographics.age < 18 || formData.demographics.age > 105) {
      errs.push('Age must be between 18 and 105.');
    }
    if (formData.demographics.weight < 30 || formData.demographics.weight > 250) {
      errs.push('Weight must be between 30 kg and 250 kg.');
    }
    if (formData.demographics.length < 100 || formData.demographics.length > 230) {
      errs.push('Height must be between 100 cm and 230 cm.');
    }
    if (formData.symptoms.bp < 70 || formData.symptoms.bp > 260) {
      errs.push('Systolic BP must be between 70 mmHg and 260 mmHg.');
    }
    if (formData.symptoms.pr < 30 || formData.symptoms.pr > 220) {
      errs.push('Pulse rate must be between 30 bpm and 220 bpm.');
    }
    if (formData.echo.ef < 10 || formData.echo.ef > 85) {
      errs.push('Ejection Fraction must be between 10% and 85%.');
    }
    if (formData.labs.ldl < 20 || formData.labs.ldl > 500) {
      errs.push('LDL cholesterol must be between 20 mg/dL and 500 mg/dL.');
    }

    setValidationErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sample Patient Loader Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1728] border border-[#1E2F45] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#35D8F2]">
            Benchmark Cohort Profiles
          </span>
          <h3 className="text-sm font-bold text-white mt-0.5">Quick Load Sample Patient Cases</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_PATIENTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPreset(p.id)}
              className="px-3 py-1.5 text-xs font-mono font-medium rounded-xl bg-[#101F33] border border-[#24374D] text-[#9BAFC5] hover:text-[#35D8F2] hover:border-[#35D8F2]/50 transition"
              title={p.description}
            >
              {p.label.split('—')[1]?.trim() || p.id}
            </button>
          ))}
        </div>
      </div>

      {/* Target Leakage Protection Badge */}
      <div className="p-3.5 rounded-xl bg-[#0E2238] border border-[#1E3A5F] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#35D8F2]">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span className="font-semibold">Target Leakage Safeguard Active</span>
        </div>
        <div className="text-[11px] text-[#9BAFC5]">
          Target labels (Cath, LAD, LCX, RCA) are strictly isolated from inputs.
        </div>
      </div>

      {/* Optional Report OCR Upload */}
      <div className="p-4 rounded-xl bg-[#101F33]/70 border border-[#24374D] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#162942] text-[#35D8F2]">
            <Upload className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Import Clinical Report (Preview)</div>
            <div className="text-[11px] text-[#9BAFC5]">
              Upload mock discharge summary or lab slip to simulate automated field extraction.
            </div>
          </div>
        </div>

        <label className="cursor-pointer px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1E2F45] text-white hover:bg-[#2A415F] transition flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span>Select File</span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={handleMockUpload}
            className="hidden"
          />
        </label>
      </div>

      {uploadStatus && (
        <div className="p-3 rounded-lg bg-[#0F2033] border border-[#35D8F2]/30 text-xs text-[#35D8F2] flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Tab Navigation: Intake Form vs Review */}
      <div className="flex items-center gap-2 border-b border-[#1E2F45] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'form'
              ? 'bg-[#35D8F2] text-[#07111F]'
              : 'text-[#9BAFC5] hover:text-white hover:bg-[#101F33]'
          }`}
        >
          Structured Input Sections
        </button>
        <button
          type="button"
          onClick={() => {
            if (validateForm()) setActiveTab('review');
          }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'review'
              ? 'bg-[#35D8F2] text-[#07111F]'
              : 'text-[#9BAFC5] hover:text-white hover:bg-[#101F33]'
          }`}
        >
          Review Data ({validationErrors.length === 0 ? 'Verified' : `${validationErrors.length} issues`})
        </button>
      </div>

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/30 space-y-1">
          <div className="text-xs font-bold text-[#F43F5E] flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Please correct the following inputs:
          </div>
          <ul className="list-disc list-inside text-xs text-[#F43F5E]/90 pl-2 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section A: Demographics */}
          <div className="p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2F45] pb-3 text-white font-semibold text-sm">
              <User className="h-4 w-4 text-[#35D8F2]" />
              <span>A. Demographics & Body Measurements</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-[#9BAFC5] block mb-1">Patient ID</label>
                <input
                  type="text"
                  value={formData.demographics.patientId}
                  onChange={(e) => handleDemographicChange('patientId', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white text-xs font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#9BAFC5] block mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="18"
                  max="105"
                  value={formData.demographics.age}
                  onChange={(e) => handleDemographicChange('age', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white text-xs font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#9BAFC5] block mb-1">Sex</label>
                <select
                  value={formData.demographics.sex}
                  onChange={(e) => handleDemographicChange('sex', e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white text-xs focus:border-[#35D8F2] outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#9BAFC5] block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  value={formData.demographics.weight}
                  onChange={(e) => handleDemographicChange('weight', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white text-xs font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#9BAFC5] block mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="230"
                  value={formData.demographics.length}
                  onChange={(e) => handleDemographicChange('length', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white text-xs font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#101F33] border border-[#1E2F45] flex items-center justify-between text-xs">
              <span className="text-[#9BAFC5]">Calculated Body Mass Index (BMI):</span>
              <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-[#162942] border border-[#24374D]">
                {formData.demographics.bmi} kg/m&sup2;{' '}
                <span className="text-[#35D8F2] text-[11px] font-normal">
                  ({formData.demographics.bmi >= 30 ? 'Obese' : formData.demographics.bmi >= 25 ? 'Overweight' : 'Normal'})
                </span>
              </span>
            </div>
          </div>

          {/* Section B: Medical History */}
          <div className="p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2F45] pb-3 text-white font-semibold text-sm">
              <Activity className="h-4 w-4 text-[#35D8F2]" />
              <span>B. Medical History & Pre-existing Conditions</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {[
                { key: 'dm', label: 'Diabetes Mellitus (DM)' },
                { key: 'htn', label: 'Hypertension (HTN)' },
                { key: 'currentSmoker', label: 'Current Smoker' },
                { key: 'exSmoker', label: 'Former Smoker' },
                { key: 'fh', label: 'Family History CAD' },
                { key: 'dlp', label: 'Dyslipidemia (DLP)' },
                { key: 'obesity', label: 'Obesity History' },
                { key: 'crf', label: 'Chronic Renal Failure' },
                { key: 'cva', label: 'Cerebrovascular Event' },
                { key: 'airwayDisease', label: 'Airway / COPD' },
                { key: 'thyroidDisease', label: 'Thyroid Disease' },
              ].map(({ key, label }) => {
                const checked = (formData.history as any)[key];
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition cursor-pointer select-none ${
                      checked
                        ? 'bg-[#35D8F2]/10 border-[#35D8F2]/40 text-white'
                        : 'bg-[#101F33] border-[#24374D] text-[#9BAFC5] hover:border-[#35D8F2]/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleHistoryChange(key as any, e.target.checked)}
                      className="rounded accent-[#35D8F2]"
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section C: Symptoms & Exam */}
          <div className="p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2F45] pb-3 text-white font-semibold text-sm">
              <Stethoscope className="h-4 w-4 text-[#35D8F2]" />
              <span>C. Symptoms & Physical Examination</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#9BAFC5] block mb-1">
                  Systolic Blood Pressure (mmHg)
                </label>
                <input
                  type="number"
                  min="70"
                  max="260"
                  value={formData.symptoms.bp}
                  onChange={(e) => handleSymptomsChange('bp', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white text-xs font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#9BAFC5] block mb-1">Pulse Rate (bpm)</label>
                <input
                  type="number"
                  min="30"
                  max="220"
                  value={formData.symptoms.pr}
                  onChange={(e) => handleSymptomsChange('pr', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white text-xs font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {[
                { key: 'typicalChestPain', label: 'Typical Angina Pain' },
                { key: 'atypicalChestPain', label: 'Atypical Chest Pain' },
                { key: 'nonanginalChestPain', label: 'Nonanginal Pain' },
                { key: 'dyspnea', label: 'Exertional Dyspnea' },
                { key: 'edema', label: 'Peripheral Edema' },
                { key: 'murmur', label: 'Heart Murmur' },
                { key: 'lungRales', label: 'Pulmonary Rales' },
              ].map(({ key, label }) => {
                const checked = (formData.symptoms as any)[key];
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition cursor-pointer select-none ${
                      checked
                        ? 'bg-[#35D8F2]/10 border-[#35D8F2]/40 text-white'
                        : 'bg-[#101F33] border-[#24374D] text-[#9BAFC5] hover:border-[#35D8F2]/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleSymptomsChange(key as any, e.target.checked)}
                      className="rounded accent-[#35D8F2]"
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section D: ECG Findings */}
          <div className="p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2F45] pb-3 text-white font-semibold text-sm">
              <Activity className="h-4 w-4 text-[#35D8F2]" />
              <span>D. Electrocardiogram (ECG) Findings</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { key: 'sinusRhythm', label: 'Normal Sinus Rhythm' },
                { key: 'arrhythmia', label: 'Arrhythmia Detected' },
                { key: 'stElevation', label: 'ST Elevation' },
                { key: 'stDepression', label: 'ST Depression' },
                { key: 'tinversion', label: 'T-Wave Inversion' },
                { key: 'qWave', label: 'Pathological Q Wave' },
                { key: 'poorRProgression', label: 'Poor R Progression' },
                { key: 'lvh', label: 'LVH by Voltage' },
              ].map(({ key, label }) => {
                const checked = (formData.ecg as any)[key];
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition cursor-pointer select-none ${
                      checked
                        ? 'bg-[#35D8F2]/10 border-[#35D8F2]/40 text-white'
                        : 'bg-[#101F33] border-[#24374D] text-[#9BAFC5] hover:border-[#35D8F2]/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleEcgChange(key as any, e.target.checked)}
                      className="rounded accent-[#35D8F2]"
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section E: Laboratory Measurements */}
          <div className="p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2F45] pb-3 text-white font-semibold text-sm">
              <FlaskConical className="h-4 w-4 text-[#35D8F2]" />
              <span>E. Laboratory Measurements</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-[#9BAFC5] block mb-1">LDL Cholesterol (mg/dL)</label>
                <input
                  type="number"
                  value={formData.labs.ldl}
                  onChange={(e) => handleLabsChange('ldl', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-[#9BAFC5] block mb-1">HDL Cholesterol (mg/dL)</label>
                <input
                  type="number"
                  value={formData.labs.hdl}
                  onChange={(e) => handleLabsChange('hdl', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-[#9BAFC5] block mb-1">Triglycerides (mg/dL)</label>
                <input
                  type="number"
                  value={formData.labs.tg}
                  onChange={(e) => handleLabsChange('tg', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-[#9BAFC5] block mb-1">Fasting Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  value={formData.labs.fbs}
                  onChange={(e) => handleLabsChange('fbs', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-[#9BAFC5] block mb-1">Serum Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.labs.cr}
                  onChange={(e) => handleLabsChange('cr', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-[#9BAFC5] block mb-1">BUN (mg/dL)</label>
                <input
                  type="number"
                  value={formData.labs.bun}
                  onChange={(e) => handleLabsChange('bun', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-[#9BAFC5] block mb-1">ESR (mm/hr)</label>
                <input
                  type="number"
                  value={formData.labs.esr}
                  onChange={(e) => handleLabsChange('esr', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-[#9BAFC5] block mb-1">Hemoglobin (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.labs.hb}
                  onChange={(e) => handleLabsChange('hb', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section F: Echocardiography */}
          <div className="p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2F45] pb-3 text-white font-semibold text-sm">
              <Heart className="h-4 w-4 text-[#35D8F2]" />
              <span>F. Echocardiography Findings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[#9BAFC5] block mb-1">Ejection Fraction (EF %)</label>
                <input
                  type="number"
                  min="10"
                  max="85"
                  value={formData.echo.ef}
                  onChange={(e) => handleEchoChange('ef', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white font-mono focus:border-[#35D8F2] outline-none"
                />
              </div>

              <div>
                <label className="text-[#9BAFC5] block mb-1">Regional Wall Motion (RWMA)</label>
                <select
                  value={formData.echo.rwma ? 'yes' : 'no'}
                  onChange={(e) => handleEchoChange('rwma', e.target.value === 'yes')}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white focus:border-[#35D8F2] outline-none"
                >
                  <option value="no">Normal Wall Motion (Negative)</option>
                  <option value="yes">RWMA Detected (Localized Defect)</option>
                </select>
              </div>

              <div>
                <label className="text-[#9BAFC5] block mb-1">Valvular Disease</label>
                <select
                  value={formData.echo.valveDisease}
                  onChange={(e) => handleEchoChange('valveDisease', e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#101F33] border border-[#24374D] text-white focus:border-[#35D8F2] outline-none"
                >
                  <option value="None">None</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#1E2F45]">
            <button
              type="button"
              onClick={() => loadPreset('PT-229')}
              className="px-4 py-2.5 rounded-xl bg-[#101F33] border border-[#24374D] text-[#9BAFC5] hover:text-white text-xs font-medium flex items-center gap-2 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Normal Baseline</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (validateForm()) setActiveTab('review');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#162942] border border-[#24374D] text-white text-xs font-medium hover:border-[#35D8F2] transition"
              >
                Review Summary
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-[#35D8F2] hover:bg-[#25C0DA] text-[#07111F] text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[#35D8F2]/20"
              >
                {isLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-[#07111F] border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Clinical Markers...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Multi-Vessel Risk Model</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Review Entered Data View */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#35D8F2]" />
              <span>Clinical Data Verification Checklist</span>
            </h3>
            <p className="text-xs text-[#9BAFC5]">
              Please verify all measured clinical parameters before computing vessel-specific probability predictions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-[#101F33] border border-[#1E2F45] space-y-1.5">
                <span className="font-mono text-[#35D8F2] uppercase text-[10px]">Demographics</span>
                <div className="text-white font-medium">
                  {formData.demographics.name} ({formData.demographics.sex}, {formData.demographics.age}y)
                </div>
                <div className="text-[#9BAFC5]">
                  Weight: {formData.demographics.weight} kg &bull; Height: {formData.demographics.length} cm &bull; BMI: {formData.demographics.bmi}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101F33] border border-[#1E2F45] space-y-1.5">
                <span className="font-mono text-[#35D8F2] uppercase text-[10px]">Vitals & Angina</span>
                <div className="text-white font-medium">
                  BP: {formData.symptoms.bp} mmHg &bull; PR: {formData.symptoms.pr} bpm
                </div>
                <div className="text-[#9BAFC5]">
                  Angina: {formData.symptoms.typicalChestPain ? 'Typical Angina' : formData.symptoms.atypicalChestPain ? 'Atypical' : 'Nonanginal'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101F33] border border-[#1E2F45] space-y-1.5">
                <span className="font-mono text-[#35D8F2] uppercase text-[10px]">Cardiac Function</span>
                <div className="text-white font-medium">
                  EF: {formData.echo.ef}% &bull; RWMA: {formData.echo.rwma ? 'Positive' : 'Negative'}
                </div>
                <div className="text-[#9BAFC5]">
                  ECG ST: {formData.ecg.stDepression ? 'Depression' : formData.ecg.stElevation ? 'Elevation' : 'Normal'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className="px-4 py-2 text-xs rounded-xl bg-[#101F33] border border-[#24374D] text-[#9BAFC5] hover:text-white"
            >
              Back to Edit Fields
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#35D8F2] hover:bg-[#25C0DA] text-[#07111F] text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[#35D8F2]/20"
            >
              <span>Confirm &amp; Run Risk Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

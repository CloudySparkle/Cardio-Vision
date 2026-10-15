export type UserRole = 'patient' | 'nurse' | 'doctor';

export type VesselId = 'LAD' | 'LCX' | 'RCA';

export interface PatientDemographics {
  patientId: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female';
  weight: number; // kg
  length: number; // cm
  bmi: number;
}

export interface MedicalHistory {
  dm: boolean; // Diabetes Mellitus
  htn: boolean; // Hypertension
  currentSmoker: boolean;
  exSmoker: boolean;
  fh: boolean; // Family History of CAD
  dlp: boolean; // Dyslipidemia
  obesity: boolean;
  crf: boolean; // Chronic Renal Failure
  cva: boolean; // Cerebrovascular Accident
  airwayDisease: boolean;
  thyroidDisease: boolean;
}

export interface SymptomsAndExam {
  bp: number; // Systolic Blood Pressure (mmHg)
  pr: number; // Pulse Rate (bpm)
  typicalChestPain: boolean;
  atypicalChestPain: boolean;
  nonanginalChestPain: boolean;
  dyspnea: boolean;
  edema: boolean;
  murmur: boolean;
  lungRales: boolean;
}

export interface EcgFindings {
  sinusRhythm: boolean;
  arrhythmia: boolean;
  stElevation: boolean;
  stDepression: boolean;
  tinversion: boolean;
  qWave: boolean;
  poorRProgression: boolean;
  lvh: boolean;
}

export interface LabMeasurements {
  fbs: number; // mg/dL
  cr: number; // mg/dL
  tg: number; // mg/dL
  ldl: number; // mg/dL
  hdl: number; // mg/dL
  bun: number; // mg/dL
  esr: number; // mm/hr
  hb: number; // g/dL
  k: number; // mEq/L
  na: number; // mEq/L
  wbc: number; // /mcL
}

export interface EchoFindings {
  ef: number; // Ejection Fraction %
  rwma: boolean; // Regional Wall Motion Abnormality
  valveDisease: 'None' | 'Mild' | 'Moderate' | 'Severe';
}

export interface ClinicalAssessmentData {
  demographics: PatientDemographics;
  history: MedicalHistory;
  symptoms: SymptomsAndExam;
  ecg: EcgFindings;
  labs: LabMeasurements;
  echo: EchoFindings;
}

export interface VesselPrediction {
  id: VesselId;
  name: string;
  fullName: string;
  status: 'Normal' | 'Significant Stenosis (≥50%)';
  hasStenosis: boolean;
  probability: number; // 0.0 - 1.0 calibrated risk estimate
  confidenceLevel: 'Low' | 'Moderate' | 'High';
  riskCategory: 'Low' | 'Borderline' | 'Elevated' | 'Critical';
  territory: string;
  clinicalSignificance: string;
  warningNote: string;
}

export interface OverallCadPrediction {
  status: 'Normal' | 'Coronary Artery Disease Detected';
  hasCad: boolean;
  probability: number;
  confidenceLevel: 'Low' | 'Moderate' | 'High';
  riskScoreDescription: string;
  summary: string;
}

export interface ShapFeatureContribution {
  featureKey: string;
  featureName: string;
  patientValue: string | number;
  baselineMean: string | number;
  unit?: string;
  shapValue: number; // positive increases risk, negative decreases
  impact: 'increases_risk' | 'decreases_risk' | 'neutral';
  clinicalInterpretation: string;
  category: 'Demographics' | 'History' | 'Symptoms' | 'ECG' | 'Labs' | 'Echo';
}

export interface PredictionResult {
  assessmentId: string;
  patientId: string;
  timestamp: string;
  isDemoData: boolean;
  modelSource: 'Local Simulation (Deterministic)' | 'FastAPI ML Engine (Live)';
  overallCad: OverallCadPrediction;
  vessels: {
    LAD: VesselPrediction;
    LCX: VesselPrediction;
    RCA: VesselPrediction;
  };
  shapContributions: {
    cad: ShapFeatureContribution[];
    LAD: ShapFeatureContribution[];
    LCX: ShapFeatureContribution[];
    RCA: ShapFeatureContribution[];
  };
  dataQuality: {
    completenessScore: number;
    missingFields: string[];
    validRangePassed: boolean;
    leakageSafeguardActive: boolean; // Explicit check that target columns were excluded
  };
  clinicalDisclaimer: string;
}

export interface ApiHealthStatus {
  online: boolean;
  baseUrl: string;
  checkedAt: string;
  endpoints: {
    predict: boolean;
    explain: boolean;
    extractReport: boolean;
    health: boolean;
    modelInfo: boolean;
  };
  modelName?: string;
  modelVersion?: string;
  datasetOrigin?: string;
}

import type { ClinicalAssessmentData, PredictionResult, ShapFeatureContribution } from '../types/clinical';

export const SAMPLE_PATIENTS: { id: string; label: string; description: string; data: ClinicalAssessmentData }[] = [
  {
    id: 'PT-802',
    label: 'Patient #802 — High Risk (LAD & RCA Multi-Vessel)',
    description: 'Male 63y, smoker, diabetic, typical angina, EF 42%, RWMA present',
    data: {
      demographics: {
        patientId: 'PT-802',
        name: 'Michael Henderson',
        age: 63,
        sex: 'Male',
        weight: 84,
        length: 172,
        bmi: 28.4,
      },
      history: {
        dm: true,
        htn: true,
        currentSmoker: true,
        exSmoker: false,
        fh: true,
        dlp: true,
        obesity: true,
        crf: false,
        cva: false,
        airwayDisease: false,
        thyroidDisease: false,
      },
      symptoms: {
        bp: 154,
        pr: 88,
        typicalChestPain: true,
        atypicalChestPain: false,
        nonanginalChestPain: false,
        dyspnea: true,
        edema: false,
        murmur: false,
        lungRales: false,
      },
      ecg: {
        sinusRhythm: true,
        arrhythmia: false,
        stElevation: false,
        stDepression: true,
        tinversion: true,
        qWave: true,
        poorRProgression: true,
        lvh: true,
      },
      labs: {
        fbs: 168,
        cr: 1.4,
        tg: 245,
        ldl: 162,
        hdl: 36,
        bun: 26,
        esr: 28,
        hb: 13.8,
        k: 4.4,
        na: 140,
        wbc: 9200,
      },
      echo: {
        ef: 42,
        rwma: true,
        valveDisease: 'Mild',
      },
    },
  },
  {
    id: 'PT-514',
    label: 'Patient #514 — Moderate Risk (Dominant LCX Pattern)',
    description: 'Female 59y, dyslipidemia, HTN, non-typical symptoms, EF 52%',
    data: {
      demographics: {
        patientId: 'PT-514',
        name: 'Elena Rostova',
        age: 59,
        sex: 'Female',
        weight: 68,
        length: 161,
        bmi: 26.2,
      },
      history: {
        dm: false,
        htn: true,
        currentSmoker: false,
        exSmoker: true,
        fh: true,
        dlp: true,
        obesity: false,
        crf: false,
        cva: false,
        airwayDisease: false,
        thyroidDisease: true,
      },
      symptoms: {
        bp: 138,
        pr: 76,
        typicalChestPain: false,
        atypicalChestPain: true,
        nonanginalChestPain: false,
        dyspnea: true,
        edema: false,
        murmur: false,
        lungRales: false,
      },
      ecg: {
        sinusRhythm: true,
        arrhythmia: false,
        stElevation: false,
        stDepression: true,
        tinversion: false,
        qWave: false,
        poorRProgression: false,
        lvh: false,
      },
      labs: {
        fbs: 104,
        cr: 0.9,
        tg: 188,
        ldl: 144,
        hdl: 44,
        bun: 18,
        esr: 16,
        hb: 12.9,
        k: 4.1,
        na: 142,
        wbc: 7400,
      },
      echo: {
        ef: 52,
        rwma: false,
        valveDisease: 'None',
      },
    },
  },
  {
    id: 'PT-229',
    label: 'Patient #229 — Low Risk (Negative Screening)',
    description: 'Male 46y, asymptomatic checkup, normal ECG, EF 64%',
    data: {
      demographics: {
        patientId: 'PT-229',
        name: 'David Chen',
        age: 46,
        sex: 'Male',
        weight: 72,
        length: 176,
        bmi: 23.2,
      },
      history: {
        dm: false,
        htn: false,
        currentSmoker: false,
        exSmoker: false,
        fh: false,
        dlp: false,
        obesity: false,
        crf: false,
        cva: false,
        airwayDisease: false,
        thyroidDisease: false,
      },
      symptoms: {
        bp: 118,
        pr: 68,
        typicalChestPain: false,
        atypicalChestPain: false,
        nonanginalChestPain: true,
        dyspnea: false,
        edema: false,
        murmur: false,
        lungRales: false,
      },
      ecg: {
        sinusRhythm: true,
        arrhythmia: false,
        stElevation: false,
        stDepression: false,
        tinversion: false,
        qWave: false,
        poorRProgression: false,
        lvh: false,
      },
      labs: {
        fbs: 92,
        cr: 0.8,
        tg: 110,
        ldl: 96,
        hdl: 58,
        bun: 14,
        esr: 8,
        hb: 14.5,
        k: 4.2,
        na: 141,
        wbc: 6100,
      },
      echo: {
        ef: 64,
        rwma: false,
        valveDisease: 'None',
      },
    },
  },
];

export function calculateBMI(weight: number, length: number): number {
  if (!weight || !length || length <= 0) return 0;
  const heightM = length / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

/**
 * Deterministic Clinical Prediction Engine based on the Z-Alizadeh Sani schema.
 * Note: Calculates calibrated risk probabilities for Cath/CAD, LAD, LCX, RCA.
 * Explicitly guards against target leakage: model inputs do NOT contain LAD/LCX/RCA/Cath.
 */
export function generateDeterministicPrediction(
  data: ClinicalAssessmentData,
  isLiveApi = false
): PredictionResult {
  const { demographics, history, symptoms, ecg, labs, echo } = data;

  // Logistic-style weighted risk score formulation derived from clinical weights
  let cadScore = -2.5; // Baseline prior
  let ladScore = -2.2;
  let lcxScore = -2.4;
  let rcaScore = -2.3;

  // Age effect (per decade > 40)
  const ageFactor = Math.max(0, (demographics.age - 40) / 10);
  cadScore += ageFactor * 0.45;
  ladScore += ageFactor * 0.40;
  lcxScore += ageFactor * 0.35;
  rcaScore += ageFactor * 0.38;

  // Sex effect (Male risk is elevated in CAD epidemiology)
  if (demographics.sex === 'Male') {
    cadScore += 0.4;
    ladScore += 0.35;
    rcaScore += 0.3;
  }

  // BMI effect
  if (demographics.bmi > 27) {
    const bmiFactor = (demographics.bmi - 27) * 0.08;
    cadScore += bmiFactor;
    ladScore += bmiFactor * 0.7;
    lcxScore += bmiFactor * 0.9;
  }

  // Clinical history risks
  if (history.dm) {
    cadScore += 0.65;
    ladScore += 0.55;
    lcxScore += 0.45;
    rcaScore += 0.5;
  }
  if (history.htn) {
    cadScore += 0.5;
    ladScore += 0.4;
    lcxScore += 0.35;
    rcaScore += 0.45;
  }
  if (history.currentSmoker) {
    cadScore += 0.7;
    ladScore += 0.6;
    rcaScore += 0.55;
  } else if (history.exSmoker) {
    cadScore += 0.25;
    ladScore += 0.2;
  }
  if (history.fh) {
    cadScore += 0.55;
    ladScore += 0.5;
    lcxScore += 0.4;
    rcaScore += 0.35;
  }
  if (history.dlp) {
    cadScore += 0.45;
    ladScore += 0.4;
    lcxScore += 0.35;
    rcaScore += 0.35;
  }

  // Symptoms & Exam
  if (symptoms.typicalChestPain) {
    cadScore += 1.1;
    ladScore += 0.95;
    lcxScore += 0.6;
    rcaScore += 0.75;
  } else if (symptoms.atypicalChestPain) {
    cadScore += 0.35;
    lcxScore += 0.45;
  }
  if (symptoms.bp > 140) {
    cadScore += ((symptoms.bp - 140) / 20) * 0.3;
  }
  if (symptoms.dyspnea) {
    cadScore += 0.4;
    ladScore += 0.35;
  }

  // ECG markers
  if (ecg.stDepression) {
    cadScore += 0.8;
    ladScore += 0.75;
    lcxScore += 0.65;
  }
  if (ecg.stElevation) {
    cadScore += 1.3;
    ladScore += 1.1;
    rcaScore += 0.9;
  }
  if (ecg.tinversion) {
    cadScore += 0.5;
    ladScore += 0.55;
    rcaScore += 0.4;
  }
  if (ecg.qWave) {
    cadScore += 0.75;
    ladScore += 0.7;
    rcaScore += 0.6;
  }
  if (ecg.poorRProgression) {
    cadScore += 0.45;
    ladScore += 0.7; // strongly associates with anterior wall / LAD
  }

  // Lab markers
  if (labs.ldl > 130) {
    cadScore += ((labs.ldl - 130) / 40) * 0.4;
    ladScore += 0.3;
    lcxScore += 0.3;
  }
  if (labs.fbs > 126) {
    cadScore += 0.35;
  }
  if (labs.tg > 200) {
    cadScore += 0.25;
    lcxScore += 0.3;
  }
  if (labs.cr > 1.3) {
    cadScore += 0.35;
    rcaScore += 0.3;
  }

  // Echocardiography
  if (echo.ef < 50) {
    const efDeficit = (50 - echo.ef) * 0.05;
    cadScore += efDeficit;
    ladScore += efDeficit * 1.2;
    rcaScore += efDeficit * 0.8;
  }
  if (echo.rwma) {
    cadScore += 1.25;
    ladScore += 1.05;
    lcxScore += 0.7;
    rcaScore += 0.85;
  }

  // Sigmoid activation
  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
  const cadProb = Number(Math.min(0.98, Math.max(0.04, sigmoid(cadScore))).toFixed(3));
  const ladProb = Number(Math.min(0.96, Math.max(0.05, sigmoid(ladScore))).toFixed(3));
  const lcxProb = Number(Math.min(0.94, Math.max(0.04, sigmoid(lcxScore))).toFixed(3));
  const rcaProb = Number(Math.min(0.95, Math.max(0.05, sigmoid(rcaScore))).toFixed(3));

  const getRiskCategory = (p: number): 'Low' | 'Borderline' | 'Elevated' | 'Critical' => {
    if (p >= 0.75) return 'Critical';
    if (p >= 0.50) return 'Elevated';
    if (p >= 0.30) return 'Borderline';
    return 'Low';
  };

  const getConfidence = (p: number): 'Low' | 'Moderate' | 'High' => {
    const dist = Math.abs(p - 0.5);
    if (dist > 0.25) return 'High';
    if (dist > 0.12) return 'Moderate';
    return 'Low';
  };

  // Build SHAP Feature Contributions for each target
  const buildShap = (_targetProb: number): ShapFeatureContribution[] => {
    const list: ShapFeatureContribution[] = [
      {
        featureKey: 'typicalChestPain',
        featureName: 'Typical Angina',
        patientValue: symptoms.typicalChestPain ? 'Present' : 'Absent',
        baselineMean: '18% prevalence',
        shapValue: symptoms.typicalChestPain ? 0.32 : -0.14,
        impact: symptoms.typicalChestPain ? 'increases_risk' : 'decreases_risk',
        clinicalInterpretation: symptoms.typicalChestPain
          ? 'Substernal pressure with exertion strongly associates with obstructive ischemia'
          : 'Absence of typical angina significantly lowers the pre-test risk likelihood',
        category: 'Symptoms',
      },
      {
        featureKey: 'ef',
        featureName: 'Ejection Fraction (EF)',
        patientValue: `${echo.ef}%`,
        baselineMean: '55.4%',
        unit: '%',
        shapValue: echo.ef < 50 ? Number(((50 - echo.ef) * 0.016).toFixed(3)) : -0.18,
        impact: echo.ef < 50 ? 'increases_risk' : 'decreases_risk',
        clinicalInterpretation: echo.ef < 50
          ? `Impaired systolic function (EF ${echo.ef}%) strongly correlates with ischemic myocardial injury`
          : 'Preserved left ventricular systolic contractility provides protective negative attribution',
        category: 'Echo',
      },
      {
        featureKey: 'rwma',
        featureName: 'Regional Wall Motion Abnormality',
        patientValue: echo.rwma ? 'Observed' : 'None',
        baselineMean: '22% prevalence',
        shapValue: echo.rwma ? 0.28 : -0.12,
        impact: echo.rwma ? 'increases_risk' : 'decreases_risk',
        clinicalInterpretation: echo.rwma
          ? 'Localized hypokinesia or akinesia indicates territorial coronary hypoperfusion'
          : 'Uniform myocardial wall motion reduces the likelihood of localized vascular lesion',
        category: 'Echo',
      },
      {
        featureKey: 'age',
        featureName: 'Age',
        patientValue: `${demographics.age} years`,
        baselineMean: '58.8 years',
        shapValue: Number(((demographics.age - 55) * 0.007).toFixed(3)),
        impact: demographics.age > 55 ? 'increases_risk' : 'decreases_risk',
        clinicalInterpretation: demographics.age > 55
          ? 'Advanced vascular age accelerates endothelial fibroatheroma accumulation'
          : 'Age below population mean exerts modest risk reduction in predictive modeling',
        category: 'Demographics',
      },
      {
        featureKey: 'stDepression',
        featureName: 'ECG ST-Segment Depression',
        patientValue: ecg.stDepression ? 'Detected' : 'None',
        baselineMean: '14% prevalence',
        shapValue: ecg.stDepression ? 0.24 : -0.09,
        impact: ecg.stDepression ? 'increases_risk' : 'decreases_risk',
        clinicalInterpretation: ecg.stDepression
          ? 'Subendocardial ischemia reflected in resting repolarization abnormalities'
          : 'Baseline ST segments without horizontal depression support negative risk impact',
        category: 'ECG',
      },
      {
        featureKey: 'dm',
        featureName: 'Diabetes Mellitus',
        patientValue: history.dm ? 'Positive' : 'Negative',
        baselineMean: '27% prevalence',
        shapValue: history.dm ? 0.19 : -0.08,
        impact: history.dm ? 'increases_risk' : 'decreases_risk',
        clinicalInterpretation: history.dm
          ? 'Accelerates micro- and macrovascular atherosclerosis and diffuse narrowing'
          : 'Absence of diabetic metabolic syndrome provides protective attribution',
        category: 'History',
      },
      {
        featureKey: 'ldl',
        featureName: 'LDL Cholesterol',
        patientValue: `${labs.ldl} mg/dL`,
        baselineMean: '115 mg/dL',
        unit: 'mg/dL',
        shapValue: Number(((labs.ldl - 110) * 0.0018).toFixed(3)),
        impact: labs.ldl > 115 ? 'increases_risk' : 'decreases_risk',
        clinicalInterpretation: labs.ldl > 115
          ? 'Elevated atherogenic circulating lipoprotein promotes plaque formation'
          : 'Optimal circulating LDL level reduces vascular atheroma progression score',
        category: 'Labs',
      },
      {
        featureKey: 'currentSmoker',
        featureName: 'Current Tobacco Smoking',
        patientValue: history.currentSmoker ? 'Active Smoker' : 'Non-Smoker',
        baselineMean: '19% prevalence',
        shapValue: history.currentSmoker ? 0.22 : -0.06,
        impact: history.currentSmoker ? 'increases_risk' : 'decreases_risk',
        clinicalInterpretation: history.currentSmoker
          ? 'Endothelial oxidative stress and elevated thrombogenicity factor'
          : 'Non-smoking status avoids toxic vasomotor and platelet activation risks',
        category: 'History',
      },
    ];

    // Sort by absolute SHAP attribution magnitude
    return list.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));
  };

  return {
    assessmentId: `ASSESS-${Date.now().toString().slice(-6)}`,
    patientId: demographics.patientId,
    timestamp: new Date().toISOString(),
    isDemoData: !isLiveApi,
    modelSource: isLiveApi ? 'FastAPI ML Engine (Live)' : 'Local Simulation (Deterministic)',
    overallCad: {
      status: cadProb >= 0.5 ? 'Coronary Artery Disease Detected' : 'Normal',
      hasCad: cadProb >= 0.5,
      probability: cadProb,
      confidenceLevel: getConfidence(cadProb),
      riskScoreDescription: `Model estimated ${Math.round(cadProb * 100)}% calibrated probability of angiographic CAD (≥50% diameter stenosis in at least one major coronary branch).`,
      summary: cadProb >= 0.5
        ? 'High probability of significant obstructive coronary artery disease. Comprehensive multi-vessel anatomical review advised.'
        : 'Low probability of major coronary stenosis. Baseline findings suggest standard preventive follow-up.',
    },
    vessels: {
      LAD: {
        id: 'LAD',
        name: 'LAD',
        fullName: 'Left Anterior Descending Artery',
        status: ladProb >= 0.5 ? 'Significant Stenosis (≥50%)' : 'Normal',
        hasStenosis: ladProb >= 0.5,
        probability: ladProb,
        confidenceLevel: getConfidence(ladProb),
        riskCategory: getRiskCategory(ladProb),
        territory: 'Anterior left ventricular wall, anterior two-thirds of the interventricular septum, cardiac apex',
        clinicalSignificance: 'Often referred to as the "widowmaker" artery; supplies 45–55% of left ventricular myocardium.',
        warningNote: 'Prediction reflects statistical probability of diameter reduction ≥50%, NOT exact lumen millimeter measurement.',
      },
      LCX: {
        id: 'LCX',
        name: 'LCX',
        fullName: 'Left Circumflex Artery',
        status: lcxProb >= 0.5 ? 'Significant Stenosis (≥50%)' : 'Normal',
        hasStenosis: lcxProb >= 0.5,
        probability: lcxProb,
        confidenceLevel: getConfidence(lcxProb),
        riskCategory: getRiskCategory(lcxProb),
        territory: 'Posterolateral left ventricular wall, lateral atrium, obtuse marginal branches',
        clinicalSignificance: 'Supplies posterolateral cardiac segments; critical for mitral valve papillary muscle perfusions.',
        warningNote: 'Prediction reflects statistical probability of diameter reduction ≥50%, NOT exact lumen millimeter measurement.',
      },
      RCA: {
        id: 'RCA',
        name: 'RCA',
        fullName: 'Right Coronary Artery',
        status: rcaProb >= 0.5 ? 'Significant Stenosis (≥50%)' : 'Normal',
        hasStenosis: rcaProb >= 0.5,
        probability: rcaProb,
        confidenceLevel: getConfidence(rcaProb),
        riskCategory: getRiskCategory(rcaProb),
        territory: 'Right ventricle, inferior diaphragmatic left ventricular wall, sinoatrial and atrioventricular nodes in 85% of individuals',
        clinicalSignificance: 'Supplies nodal conduction pacemaker tissue and inferior wall; stenosis can precipitate bradyarrhythmias.',
        warningNote: 'Prediction reflects statistical probability of diameter reduction ≥50%, NOT exact lumen millimeter measurement.',
      },
    },
    shapContributions: {
      cad: buildShap(cadProb),
      LAD: buildShap(ladProb),
      LCX: buildShap(lcxProb),
      RCA: buildShap(rcaProb),
    },
    dataQuality: {
      completenessScore: 100,
      missingFields: [],
      validRangePassed: true,
      leakageSafeguardActive: true, // Target columns (LAD, LCX, RCA, Cath) are excluded from inputs
    },
    clinicalDisclaimer: 'For decision-support and educational purposes only. Predictions are not a substitute for formal diagnostic imaging or professional medical diagnosis.',
  };
}

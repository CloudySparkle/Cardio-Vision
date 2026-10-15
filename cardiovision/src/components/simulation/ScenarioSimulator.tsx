import { useState, type FC } from 'react';
import type { ClinicalAssessmentData, PredictionResult, VesselId } from '../../types/clinical';
import { generateDeterministicPrediction } from '../../services/demoService';
import { Sliders, RotateCcw, AlertTriangle, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';

interface ScenarioSimulatorProps {
  baselineData: ClinicalAssessmentData;
  baselinePrediction: PredictionResult;
  onApplyScenario?: (simulatedData: ClinicalAssessmentData) => void;
}

export const ScenarioSimulator: FC<ScenarioSimulatorProps> = ({
  baselineData,
  baselinePrediction,
  onApplyScenario,
}) => {
  // Modified scenario copy
  const [simData, setSimData] = useState<ClinicalAssessmentData>(
    JSON.parse(JSON.stringify(baselineData))
  );

  const updatedPrediction = generateDeterministicPrediction(simData, false);

  const handleSliderChange = (
    section: 'demographics' | 'symptoms' | 'labs' | 'echo',
    field: string,
    val: number
  ) => {
    setSimData((prev) => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: val,
      },
    }));
  };

  const handleToggleSmoking = (isSmoking: boolean) => {
    setSimData((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        currentSmoker: isSmoking,
        exSmoker: !isSmoking && baselineData.history.currentSmoker,
      },
    }));
  };

  const handleToggleAngina = (isTypical: boolean) => {
    setSimData((prev) => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        typicalChestPain: isTypical,
        atypicalChestPain: !isTypical && baselineData.symptoms.atypicalChestPain,
      },
    }));
  };

  const resetSimulation = () => {
    setSimData(JSON.parse(JSON.stringify(baselineData)));
  };

  const getDeltaBadge = (baseProb: number, newProb: number) => {
    const delta = Math.round((newProb - baseProb) * 100);
    if (delta === 0) return <span className="text-[#9BAFC5] font-mono text-xs">0%</span>;
    if (delta > 0) {
      return (
        <span className="flex items-center gap-1 text-[#F43F5E] font-mono font-bold text-xs">
          <TrendingUp className="h-3.5 w-3.5" /> +{delta}%
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[#10B981] font-mono font-bold text-xs">
        <TrendingDown className="h-3.5 w-3.5" /> {delta}%
      </span>
    );
  };

  const targets: { id: VesselId | 'CAD'; name: string; baseP: number; newP: number }[] = [
    {
      id: 'CAD',
      name: 'Overall CAD',
      baseP: baselinePrediction.overallCad.probability,
      newP: updatedPrediction.overallCad.probability,
    },
    {
      id: 'LAD',
      name: 'LAD Artery',
      baseP: baselinePrediction.vessels.LAD.probability,
      newP: updatedPrediction.vessels.LAD.probability,
    },
    {
      id: 'LCX',
      name: 'LCX Artery',
      baseP: baselinePrediction.vessels.LCX.probability,
      newP: updatedPrediction.vessels.LCX.probability,
    },
    {
      id: 'RCA',
      name: 'RCA Artery',
      baseP: baselinePrediction.vessels.RCA.probability,
      newP: updatedPrediction.vessels.RCA.probability,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Simulation Banner */}
      <div className="p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#35D8F2]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#35D8F2]">
              Interactive Sensitivity Tool
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">&quot;What Changed?&quot; Scenario Simulator</h2>
          <p className="text-xs text-[#9BAFC5] mt-1 max-w-2xl">
            Simulate how changes in specific clinical variables (e.g. smoking cessation, BP optimization, lipid management) influence the model&apos;s statistical risk outputs.
          </p>
        </div>

        <button
          onClick={resetSimulation}
          className="px-3.5 py-2 rounded-xl bg-[#101F33] border border-[#24374D] text-[#9BAFC5] hover:text-white text-xs font-medium flex items-center gap-2 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Mandatory Behavioral Notice */}
      <div className="p-3.5 rounded-xl bg-[#0E1F35] border border-[#1E3A5F] flex items-start gap-3 text-xs text-[#9BAFC5]">
        <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Model Sensitivity Demonstration Only:</strong> Adjusting input features tests the algorithmic responsiveness of the decision tree. This does not represent medical advice, guaranteed plaque regression, or clinical prognosis.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Adjustment Controls */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-5">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-[#1E2F45] pb-3">
            Simulate Clinical Adjustments
          </h3>

          {/* Systolic BP Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white">Systolic Blood Pressure</span>
              <span className="font-mono text-[#35D8F2] font-bold">
                {simData.symptoms.bp} mmHg{' '}
                <span className="text-[#9BAFC5] font-normal">
                  (Baseline: {baselineData.symptoms.bp})
                </span>
              </span>
            </div>
            <input
              type="range"
              min="90"
              max="200"
              value={simData.symptoms.bp}
              onChange={(e) => handleSliderChange('symptoms', 'bp', Number(e.target.value))}
              className="w-full accent-[#35D8F2]"
            />
            <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
              <span>90 mmHg (Optimal)</span>
              <span>140 mmHg (Stage 1 HTN)</span>
              <span>200 mmHg (Crisis)</span>
            </div>
          </div>

          {/* LDL Cholesterol Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white">LDL Cholesterol</span>
              <span className="font-mono text-[#35D8F2] font-bold">
                {simData.labs.ldl} mg/dL{' '}
                <span className="text-[#9BAFC5] font-normal">
                  (Baseline: {baselineData.labs.ldl})
                </span>
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              value={simData.labs.ldl}
              onChange={(e) => handleSliderChange('labs', 'ldl', Number(e.target.value))}
              className="w-full accent-[#35D8F2]"
            />
            <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
              <span>50 mg/dL (Aggressive)</span>
              <span>100 mg/dL (Normal)</span>
              <span>250 mg/dL (Severe)</span>
            </div>
          </div>

          {/* Ejection Fraction Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white">Ejection Fraction (EF %)</span>
              <span className="font-mono text-[#35D8F2] font-bold">
                {simData.echo.ef}%{' '}
                <span className="text-[#9BAFC5] font-normal">
                  (Baseline: {baselineData.echo.ef}%)
                </span>
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              value={simData.echo.ef}
              onChange={(e) => handleEchoChangeSlider(Number(e.target.value))}
              className="w-full accent-[#35D8F2]"
            />
            <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
              <span>20% (Severely Reduced)</span>
              <span>50% (Normal Threshold)</span>
              <span>70% (Hyperdynamic)</span>
            </div>
          </div>

          {/* Lifestyle Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#101F33] border border-[#1E2F45] text-xs">
              <span className="text-[#9BAFC5] block mb-2">Smoking Habit</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleSmoking(false)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                    !simData.history.currentSmoker
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#162942] text-[#9BAFC5]'
                  }`}
                >
                  Non-Smoker
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSmoking(true)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                    simData.history.currentSmoker
                      ? 'bg-[#F43F5E] text-white'
                      : 'bg-[#162942] text-[#9BAFC5]'
                  }`}
                >
                  Active
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#101F33] border border-[#1E2F45] text-xs">
              <span className="text-[#9BAFC5] block mb-2">Angina Symptom</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAngina(false)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                    !simData.symptoms.typicalChestPain
                      ? 'bg-[#35D8F2] text-[#07111F]'
                      : 'bg-[#162942] text-[#9BAFC5]'
                  }`}
                >
                  Asymptomatic
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAngina(true)}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                    simData.symptoms.typicalChestPain
                      ? 'bg-[#F43F5E] text-white'
                      : 'bg-[#162942] text-[#9BAFC5]'
                  }`}
                >
                  Typical
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Prediction Deltas */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-[#1E2F45] pb-3">
              Baseline vs. Simulated Prediction
            </h3>

            <div className="space-y-3 pt-3">
              {targets.map((tgt) => (
                <div
                  key={tgt.id}
                  className="p-3.5 rounded-xl bg-[#101F33] border border-[#1E2F45] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{tgt.name}</div>
                    <div className="text-[11px] text-[#9BAFC5]">
                      Baseline: <span className="font-mono text-white">{Math.round(tgt.baseP * 100)}%</span> &rarr; Simulated:{' '}
                      <span className="font-mono text-[#35D8F2] font-bold">
                        {Math.round(tgt.newP * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getDeltaBadge(tgt.baseP, tgt.newP)}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        tgt.newP >= 0.5
                          ? 'bg-[#F43F5E]/15 border-[#F43F5E]/30 text-[#F43F5E]'
                          : 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                      }`}
                    >
                      {tgt.newP >= 0.5 ? 'Stenosis' : 'Normal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {onApplyScenario && (
            <div className="pt-4 border-t border-[#1E2F45]">
              <button
                type="button"
                onClick={() => onApplyScenario(simData)}
                className="w-full py-2.5 rounded-xl bg-[#35D8F2] hover:bg-[#25C0DA] text-[#07111F] text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-[#35D8F2]/20"
              >
                <span>Commit Scenario as New Assessment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function handleEchoChangeSlider(val: number) {
    setSimData((prev) => ({
      ...prev,
      echo: {
        ...prev.echo,
        ef: val,
      },
    }));
  }
};

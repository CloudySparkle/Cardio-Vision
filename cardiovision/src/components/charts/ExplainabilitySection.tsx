import { useState, type FC } from 'react';
import type { PredictionResult, ShapFeatureContribution, UserRole, VesselId } from '../../types/clinical';
import { HelpCircle, TrendingUp, TrendingDown, Sparkles, ShieldAlert, Cpu } from 'lucide-react';

interface ExplainabilitySectionProps {
  prediction: PredictionResult;
  userRole: UserRole;
  selectedTarget?: VesselId | 'CAD';
  onSelectTarget?: (target: VesselId | 'CAD') => void;
}

export const ExplainabilitySection: FC<ExplainabilitySectionProps> = ({
  prediction,
  userRole,
  selectedTarget: externalTarget,
  onSelectTarget,
}) => {
  const [internalTarget, setInternalTarget] = useState<VesselId | 'CAD'>('CAD');
  const activeTarget = externalTarget || internalTarget;

  const handleTargetChange = (target: VesselId | 'CAD') => {
    if (onSelectTarget) {
      onSelectTarget(target);
    } else {
      setInternalTarget(target);
    }
  };

  const getTargetFeatures = (): ShapFeatureContribution[] => {
    if (activeTarget === 'CAD') return prediction.shapContributions.cad;
    return prediction.shapContributions[activeTarget] || prediction.shapContributions.cad;
  };

  const features = getTargetFeatures();
  const maxShap = Math.max(...features.map((f) => Math.abs(f.shapValue)), 0.35);

  const getTargetTitle = () => {
    if (activeTarget === 'CAD') return 'Overall Coronary Artery Disease (CAD)';
    if (activeTarget === 'LAD') return 'Left Anterior Descending Artery (LAD)';
    if (activeTarget === 'LCX') return 'Left Circumflex Artery (LCX)';
    return 'Right Coronary Artery (RCA)';
  };

  const getTargetProbability = () => {
    if (activeTarget === 'CAD') return prediction.overallCad.probability;
    return prediction.vessels[activeTarget].probability;
  };

  const targetProb = getTargetProbability();

  return (
    <div className="space-y-6">
      {/* Explainability Header & Target Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#35D8F2]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#35D8F2]">
              Transparent Decision Support
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Explainable AI (SHAP Feature Attribution)</h2>
          <p className="text-xs text-[#9BAFC5] mt-1 max-w-2xl">
            Statistical breakdown of clinical features associated with this model output. Values represent additive feature attributions towards the estimated probability.
          </p>
        </div>

        {/* Target Selector Buttons */}
        <div className="flex items-center gap-2 bg-[#101F33] p-1.5 rounded-xl border border-[#24374D]">
          {(['CAD', 'LAD', 'LCX', 'RCA'] as (VesselId | 'CAD')[]).map((tgt) => {
            const isSel = activeTarget === tgt;
            return (
              <button
                key={tgt}
                onClick={() => handleTargetChange(tgt)}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                  isSel
                    ? 'bg-[#35D8F2] text-[#07111F] shadow-md shadow-[#35D8F2]/20'
                    : 'text-[#9BAFC5] hover:text-white hover:bg-[#162942]'
                }`}
              >
                {tgt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Status Banner */}
      <div className="p-4 rounded-xl bg-[#101F33]/80 border border-[#1E2F45] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor: targetProb >= 0.5 ? '#F43F5E' : targetProb >= 0.3 ? '#F59E0B' : '#35D8F2',
            }}
          />
          <div>
            <div className="text-sm font-semibold text-white">{getTargetTitle()}</div>
            <div className="text-xs text-[#9BAFC5]">
              Target Prediction: <span className="font-mono font-bold text-white">{Math.round(targetProb * 100)}%</span> calibrated risk probability
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-[#07111F] border border-[#24374D] text-[#35D8F2] flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5" />
            {prediction.modelSource}
          </span>
          {prediction.isDemoData && (
            <span className="px-2.5 py-1 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]">
              Simulated Attributions
            </span>
          )}
        </div>
      </div>

      {/* Narrative Explanation Adapted by Role */}
      <div className="p-5 rounded-2xl bg-[#0E1C2E] border border-[#1E2F45]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
          <HelpCircle className="h-4 w-4 text-[#35D8F2]" />
          {userRole === 'patient'
            ? 'Plain Language Summary for Patients'
            : userRole === 'nurse'
            ? 'Clinical Intake Summary for Nurses'
            : 'Detailed SHAP Technical Interpretation for Physicians'}
        </h3>

        {userRole === 'patient' ? (
          <p className="text-xs md:text-sm text-[#9BAFC5] leading-relaxed">
            The computer model looks at all the health metrics you entered together. Features like your age, cholesterol readings, blood pressure, and symptom history are compared to statistical patterns in medical studies. In your case, the biggest indicators affecting this assessment are{' '}
            <strong className="text-white">
              {features[0]?.featureName} ({features[0]?.patientValue})
            </strong>{' '}
            and{' '}
            <strong className="text-white">
              {features[1]?.featureName} ({features[1]?.patientValue})
            </strong>
            . This is not a diagnosis and should be discussed with your physician.
          </p>
        ) : userRole === 'nurse' ? (
          <p className="text-xs md:text-sm text-[#9BAFC5] leading-relaxed">
            Patient profile submitted with complete demographic, vitals, and cardiac markers. The model highlights positive risk elevation driven primarily by{' '}
            <strong className="text-white">
              {features[0]?.featureName} ({features[0]?.patientValue})
            </strong>{' '}
            and{' '}
            <strong className="text-white">{features[1]?.featureName}</strong>. Please ensure resting ECG recordings and lipid panel inputs are verified prior to physician sign-off.
          </p>
        ) : (
          <p className="text-xs md:text-sm text-[#9BAFC5] leading-relaxed">
            Additive TreeExplainer / KernelSHAP values computed relative to the empirical background distribution (303 patient cohort from the Z-Alizadeh Sani protocol). Features with positive SHAP attribution push model logits higher towards the positive class (stenosis &ge; 50%), while negative values offset predicted risk. No direct causal link is inferred beyond statistical associative weight.
          </p>
        )}
      </div>

      {/* SHAP Waterfall / Feature Impact Bar Chart */}
      <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2F45] pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Key Contributing Features ({features.length})
          </h3>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#F43F5E]">
              <TrendingUp className="h-3.5 w-3.5" /> Increases Risk (+)
            </span>
            <span className="flex items-center gap-1.5 text-[#10B981]">
              <TrendingDown className="h-3.5 w-3.5" /> Lowers Risk (&minus;)
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {features.map((feat) => {
            const isRisk = feat.shapValue > 0;
            const widthPct = Math.min(100, Math.round((Math.abs(feat.shapValue) / maxShap) * 100));

            return (
              <div
                key={feat.featureKey}
                className="p-3 rounded-xl bg-[#101F33]/60 border border-[#1E2F45] hover:border-[#35D8F2]/30 transition space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{feat.featureName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#162942] text-[#9BAFC5]">
                      {feat.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[#9BAFC5]">
                      Patient Value: <strong className="text-white">{feat.patientValue}</strong>
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs ${
                        isRisk
                          ? 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30'
                          : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                      }`}
                    >
                      {isRisk ? `+${feat.shapValue}` : feat.shapValue}
                    </span>
                  </div>
                </div>

                {/* Relative Bar Visualization */}
                <div className="relative w-full h-3 bg-[#07111F] rounded-full overflow-hidden flex items-center">
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#24374D] z-10" />
                  {isRisk ? (
                    <div
                      className="absolute left-1/2 h-full rounded-r-full bg-gradient-to-r from-[#F43F5E]/60 to-[#F43F5E] transition-all duration-500"
                      style={{ width: `${widthPct / 2}%` }}
                    />
                  ) : (
                    <div
                      className="absolute right-1/2 h-full rounded-l-full bg-gradient-to-l from-[#10B981]/60 to-[#10B981] transition-all duration-500"
                      style={{ width: `${widthPct / 2}%` }}
                    />
                  )}
                </div>

                {/* Clinical Interpretation */}
                <div className="text-[11px] text-[#9BAFC5] leading-relaxed flex items-start gap-1.5 pt-0.5">
                  <span className="text-[#64748B]">&bull;</span>
                  <span>{feat.clinicalInterpretation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety & Medical Disclaimer Box */}
      <div className="p-4 rounded-xl bg-[#081220] border border-[#24374D] flex items-start gap-3 text-xs text-[#9BAFC5]">
        <ShieldAlert className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Statistical Attribution Notice</strong>
          SHAP values isolate statistical associations discovered during empirical machine learning training on historical patient cohorts. Feature attributions do not demonstrate direct mechanical causality and must never be interpreted as individual therapeutic guidelines.
        </div>
      </div>
    </div>
  );
};

import { type FC } from 'react';
import type { ClinicalAssessmentData, PredictionResult } from '../../types/clinical';
import { Columns3, AlertTriangle } from 'lucide-react';

interface AssessmentComparisonProps {
  assessmentA: {
    data: ClinicalAssessmentData;
    prediction: PredictionResult;
    title: string;
  };
  assessmentB: {
    data: ClinicalAssessmentData;
    prediction: PredictionResult;
    title: string;
  };
}

export const AssessmentComparison: FC<AssessmentComparisonProps> = ({
  assessmentA,
  assessmentB,
}) => {
  const getProbColor = (p: number) => {
    if (p >= 0.5) return 'text-[#F43F5E]';
    if (p >= 0.3) return 'text-[#F59E0B]';
    return 'text-[#35D8F2]';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45]">
        <div className="flex items-center gap-2">
          <Columns3 className="h-4 w-4 text-[#35D8F2]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#35D8F2]">
            Multi-Case Analysis
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1">Side-by-Side Assessment Comparison</h2>
        <p className="text-xs text-[#9BAFC5] mt-1 max-w-2xl">
          Comparative evaluation of clinical inputs and resulting AI risk probabilities across two patient evaluations.
        </p>
      </div>

      {/* Progression Notice */}
      <div className="p-3.5 rounded-xl bg-[#0E1F35] border border-[#1E3A5F] flex items-start gap-3 text-xs text-[#9BAFC5]">
        <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Disease Progression Disclaimer:</strong> Model probability variances represent cross-sectional statistical inferences based on differing feature inputs. Differences between evaluations must not be claimed as verified anatomical plaque progression or regression without confirmed coronary angiography.
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile A */}
        <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
          <div className="border-b border-[#1E2F45] pb-3">
            <span className="text-[10px] font-mono uppercase text-[#35D8F2]">Assessment Profile A</span>
            <h3 className="text-base font-bold text-white">{assessmentA.title}</h3>
            <span className="text-xs text-[#9BAFC5]">
              {assessmentA.data.demographics.name} &bull; {assessmentA.data.demographics.age}y &bull; {assessmentA.data.demographics.sex}
            </span>
          </div>

          {/* Predictions Summary */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#64748B]">Predicted Targets</span>
            <div className="p-3 rounded-xl bg-[#101F33] border border-[#1E2F45] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Overall CAD:</span>
                <span className={`font-mono font-bold ${getProbColor(assessmentA.prediction.overallCad.probability)}`}>
                  {Math.round(assessmentA.prediction.overallCad.probability * 100)}% ({assessmentA.prediction.overallCad.status})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">LAD Artery:</span>
                <span className={`font-mono font-bold ${getProbColor(assessmentA.prediction.vessels.LAD.probability)}`}>
                  {Math.round(assessmentA.prediction.vessels.LAD.probability * 100)}% ({assessmentA.prediction.vessels.LAD.status})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">LCX Artery:</span>
                <span className={`font-mono font-bold ${getProbColor(assessmentA.prediction.vessels.LCX.probability)}`}>
                  {Math.round(assessmentA.prediction.vessels.LCX.probability * 100)}% ({assessmentA.prediction.vessels.LCX.status})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">RCA Artery:</span>
                <span className={`font-mono font-bold ${getProbColor(assessmentA.prediction.vessels.RCA.probability)}`}>
                  {Math.round(assessmentA.prediction.vessels.RCA.probability * 100)}% ({assessmentA.prediction.vessels.RCA.status})
                </span>
              </div>
            </div>
          </div>

          {/* Key Clinical Markers */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#64748B]">Clinical Key Features</span>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#9BAFC5]">
              <div className="p-2.5 rounded-lg bg-[#101F33]">
                BP: <strong className="text-white">{assessmentA.data.symptoms.bp} mmHg</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101F33]">
                EF: <strong className="text-white">{assessmentA.data.echo.ef}%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101F33]">
                LDL: <strong className="text-white">{assessmentA.data.labs.ldl} mg/dL</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101F33]">
                Smoking: <strong className="text-white">{assessmentA.data.history.currentSmoker ? 'Active' : 'No'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Profile B */}
        <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
          <div className="border-b border-[#1E2F45] pb-3">
            <span className="text-[10px] font-mono uppercase text-[#35D8F2]">Assessment Profile B</span>
            <h3 className="text-base font-bold text-white">{assessmentB.title}</h3>
            <span className="text-xs text-[#9BAFC5]">
              {assessmentB.data.demographics.name} &bull; {assessmentB.data.demographics.age}y &bull; {assessmentB.data.demographics.sex}
            </span>
          </div>

          {/* Predictions Summary */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#64748B]">Predicted Targets</span>
            <div className="p-3 rounded-xl bg-[#101F33] border border-[#1E2F45] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Overall CAD:</span>
                <span className={`font-mono font-bold ${getProbColor(assessmentB.prediction.overallCad.probability)}`}>
                  {Math.round(assessmentB.prediction.overallCad.probability * 100)}% ({assessmentB.prediction.overallCad.status})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">LAD Artery:</span>
                <span className={`font-mono font-bold ${getProbColor(assessmentB.prediction.vessels.LAD.probability)}`}>
                  {Math.round(assessmentB.prediction.vessels.LAD.probability * 100)}% ({assessmentB.prediction.vessels.LAD.status})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">LCX Artery:</span>
                <span className={`font-mono font-bold ${getProbColor(assessmentB.prediction.vessels.LCX.probability)}`}>
                  {Math.round(assessmentB.prediction.vessels.LCX.probability * 100)}% ({assessmentB.prediction.vessels.LCX.status})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">RCA Artery:</span>
                <span className={`font-mono font-bold ${getProbColor(assessmentB.prediction.vessels.RCA.probability)}`}>
                  {Math.round(assessmentB.prediction.vessels.RCA.probability * 100)}% ({assessmentB.prediction.vessels.RCA.status})
                </span>
              </div>
            </div>
          </div>

          {/* Key Clinical Markers */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#64748B]">Clinical Key Features</span>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#9BAFC5]">
              <div className="p-2.5 rounded-lg bg-[#101F33]">
                BP: <strong className="text-white">{assessmentB.data.symptoms.bp} mmHg</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101F33]">
                EF: <strong className="text-white">{assessmentB.data.echo.ef}%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101F33]">
                LDL: <strong className="text-white">{assessmentB.data.labs.ldl} mg/dL</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101F33]">
                Smoking: <strong className="text-white">{assessmentB.data.history.currentSmoker ? 'Active' : 'No'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

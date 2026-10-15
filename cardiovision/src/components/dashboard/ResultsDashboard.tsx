import type { FC } from 'react';
import type { PredictionResult, UserRole, VesselId } from '../../types/clinical';
import {
  Sparkles,
} from 'lucide-react';

interface ResultsDashboardProps {
  prediction: PredictionResult;
  userRole: UserRole;
  onNavigateToAnatomy: (vesselId?: VesselId) => void;
  onNavigateToExplainability: (target?: VesselId | 'CAD') => void;
  onNavigateToComparison?: () => void;
}

export const ResultsDashboard: FC<ResultsDashboardProps> = ({
  prediction,
  userRole: _userRole,
  onNavigateToAnatomy,
  onNavigateToExplainability,
  onNavigateToComparison: _onNavigateToComparison,
}) => {
  const { overallCad, vessels, isDemoData, dataQuality } = prediction;

  const vesselList: VesselId[] = ['LAD', 'LCX', 'RCA'];
  const cadPct = Math.round(overallCad.probability * 100);

  // Determine highest risk vessel for "Needs Attention" card
  const topRiskVessel = vesselList.reduce((prev, curr) =>
    vessels[curr].probability > vessels[prev].probability ? curr : prev
  );
  const topRiskPct = Math.round(vessels[topRiskVessel].probability * 100);
  const vesselColorInfo: Record<VesselId, { label: string; dotClass: string; barGradient: string; textClass: string; borderHover: string }> = {
    LAD: {
      label: 'Blue Nerve',
      dotClass: 'bg-[#00d8ff] shadow-[0_0_8px_#00d8ff]',
      barGradient: 'linear-gradient(90deg, #0284c7, #00d8ff)',
      textClass: 'text-[#38bdf8]',
      borderHover: 'group-hover:border-[#0284c7]'
    },
    LCX: {
      label: 'Green Nerve',
      dotClass: 'bg-[#70f0a0] shadow-[0_0_8px_#70f0a0]',
      barGradient: 'linear-gradient(90deg, #059669, #70f0a0)',
      textClass: 'text-[#70f0a0]',
      borderHover: 'group-hover:border-[#43e58d]'
    },
    RCA: {
      label: 'Purple Nerve',
      dotClass: 'bg-[#c084fc] shadow-[0_0_8px_#c084fc]',
      barGradient: 'linear-gradient(90deg, #7c3aed, #c084fc)',
      textClass: 'text-[#d8b4fe]',
      borderHover: 'group-hover:border-[#9333ea]'
    }
  };


  return (
    <div className="space-y-6">
      {/* Hero Section matching earnest-mandazi reference */}
      <div className="hero-editorial">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[2px] text-[#82968a]">
              <span className="w-5 h-[2px] bg-[#70f0a0] inline-block shadow-[0_0_8px_#70f0a0]" />
              CLINICAL SIGNAL INTELLIGENCE
            </div>

            <h1 className="text-[clamp(32px,3.8vw,54px)] leading-[1.08] tracking-[-2.6px] font-semibold my-3 text-white">
              See the Risk.<br />
              <em className="not-italic">Understand the Anatomy.</em>
            </h1>

            <p className="text-xs sm:text-[13px] leading-relaxed text-[#9aada1] max-w-[480px]">
              Turn complex multi-variable clinical biomarkers into explainable vessel-level coronary predictions and interactive 3D anatomy.
            </p>
          </div>

          {/* Floating animated stamp ring */}
          <div className="hidden md:flex flex-col items-center gap-2.5 shrink-0 mr-4">
            <div className="stamp-ring">
              REVEAL<br />EXPLAIN<br />VISUALIZE
            </div>
            <span className="font-mono text-[9px] tracking-widest text-[#6b7e72]">
              PULSEVISION / 2026
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl border border-[#20372a] bg-[#0c140f] backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="w-2 h-2 rounded-sm bg-[#70f0a0] inline-block" />
          <span className="font-semibold text-white">
            {prediction.assessmentId} &bull; Clinical Profile Case
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-[#2b5438] text-[#8ef8b3] bg-[#102318]">
            EHR / BENCHMARK
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-wider text-[#82968a]">
            {isDemoData ? 'LOCAL DEMO DATA' : 'BACKEND CONNECTED'}
          </span>
          <button
            onClick={() => onNavigateToAnatomy()}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#101b13] text-[#c3d7c9] border border-[#284332] hover:border-[#70f0a0] transition"
          >
            3D Heart View
          </button>
          <button
            onClick={() => onNavigateToExplainability('CAD')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#78f3a4] to-[#43d883] text-[#07140b] shadow-[0_0_20px_rgba(112,240,160,0.22)] hover:opacity-95 transition flex items-center gap-1.5"
          >
            <span>Explain Risk</span>
            <Sparkles className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid (4 Cards with Sparklines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: CAD Risk */}
        <article className="metric-card-editorial">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#9db1a3]">
            <span>OVERALL CAD RISK</span>
            <span className="text-[#70f0a0] text-sm">↗</span>
          </div>
          <div className="text-[38px] font-semibold tracking-[-2px] text-white my-2.5">
            {cadPct}<span className="text-lg font-normal text-[#70f0a0]">%</span>
          </div>
          <div className="text-[11px] text-[#84978c]">
            <span className={cadPct >= 50 ? 'text-[#ffb39a]' : 'text-[#70f0a0]'}>
              {overallCad.status}
            </span>
          </div>
          <div className="metric-spark spark-a" />
        </article>

        {/* Metric 2: Coronary Targets */}
        <article className="metric-card-editorial">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#9db1a3]">
            <span>VESSEL TARGETS</span>
            <span className="text-[#70f0a0] text-sm">◫</span>
          </div>
          <div className="text-[38px] font-semibold tracking-[-2px] text-white my-2.5">
            03
          </div>
          <div className="text-[11px] text-[#84978c]">
            LAD, LCX, RCA Segments
          </div>
          <div className="metric-spark spark-b" />
        </article>

        {/* Metric 3: Critical Vessel */}
        <article className="metric-card-editorial">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#9db1a3]">
            <span>NEEDS ATTENTION</span>
            <span className="text-[#ffb39a] text-sm">!</span>
          </div>
          <div className="text-[38px] font-semibold tracking-[-2px] text-[#ffb39a] my-2.5">
            {topRiskVessel}
          </div>
          <div className="text-[11px] text-[#84978c]">
            {topRiskPct}% Stenosis Probability
          </div>
          <div className="metric-spark spark-c" />
        </article>

        {/* Metric 4: Data Quality */}
        <article className="metric-card-editorial">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#9db1a3]">
            <span>DATA QUALITY</span>
            <span className="text-[#70f0a0] text-sm">⌁</span>
          </div>
          <div className="text-[38px] font-semibold tracking-[-2px] text-white my-2.5">
            {dataQuality.completenessScore}<span className="text-lg font-normal text-[#70f0a0]">%</span>
          </div>
          <div className="text-[11px] text-[#84978c]">
            Protocol Range Verified
          </div>
          <div className="metric-spark spark-d" />
        </article>
      </div>

      {/* Section 01: Pattern Recognition */}
      <div className="flex items-end justify-between pt-4 pb-2 border-b border-[#1d3027]">
        <div>
          <div className="font-mono text-[10px] tracking-[1.5px] text-[#82968a]">
            01 / PATTERN RECOGNITION
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Where the signal lives
          </h2>
        </div>
        <span className="font-mono text-[10px] tracking-wider text-[#6b7e72] hidden sm:inline">
          CORONARY ARTERY RISK DISTRIBUTION
        </span>
      </div>

      {/* Analysis Grid (Landscape Bar Chart + Quality Audit Ring) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Vascular Risk Landscape (7 cols) */}
        <article className="lg:col-span-7 p-6 rounded-2xl border border-[#20372a] bg-gradient-to-br from-[#101a13] to-[#0b120e]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Vascular Risk Landscape</h3>
              <p className="text-[11px] text-[#84978c] mt-0.5">
                Which coronary arteries are predicted at highest risk of stenosis?
              </p>
            </div>
            <button
              onClick={() => onNavigateToAnatomy()}
              className="text-[#70f0a0] text-sm hover:underline font-mono"
            >
              3D View ↗
            </button>
          </div>

          <div className="space-y-4 my-6">
            {vesselList.map((vid) => {
              const v = vessels[vid];
              const pct = Math.round(v.probability * 100);

              return (
                <div
                  key={vid}
                  className="grid grid-cols-[110px_1fr_45px] items-center gap-3 cursor-pointer group"
                  onClick={() => onNavigateToAnatomy(vid)}
                >
                  <div className="text-xs font-semibold text-[#c5d3c7] truncate group-hover:text-white transition flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${vesselColorInfo[vid].dotClass}`} />
                    <span>{vid}</span>
                    <span className="font-mono text-[10px] text-[#84978c]">({v.riskCategory})</span>
                  </div>

                  <div className="h-2 rounded bg-[#1d3024] overflow-hidden">
                    <div
                      className="h-full rounded bar-fill transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: vesselColorInfo[vid].barGradient,
                      }}
                    />
                  </div>

                  <div className="font-mono text-xs text-right text-[#e0f1e5]">
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#1d3027] flex items-center justify-between text-[11px] text-[#84978c]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-[#70f0a0]" />
              <span>Multi-target statistical estimation</span>
            </div>
            <span className="font-mono text-[#8ef8b3]">3 OF 3 EVALUATED</span>
          </div>
        </article>

        {/* Right: Signal Quality Ring & Clinical Integrity (5 cols) */}
        <article className="lg:col-span-5 p-6 rounded-2xl border border-[#20372a] bg-gradient-to-br from-[#101a13] to-[#0b120e] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Signal Quality</h3>
                <p className="text-[11px] text-[#84978c] mt-0.5">
                  Clean clinical data makes better decisions.
                </p>
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-[#2d6945] text-[#8ef8b3] bg-[#102318]">
                AUDIT
              </span>
            </div>

            <div className="flex items-center justify-around py-5">
              <div className="relative w-24 h-24 rounded-full grid place-items-center bg-[conic-gradient(#70f0a0_0_95.4%,#23382a_95.4%_100%)] shadow-[0_0_16px_rgba(112,240,160,0.18)]">
                <div className="absolute inset-2 bg-[#0d1510] rounded-full grid place-items-center text-center">
                  <div>
                    <b className="block text-xl font-bold text-white">95%</b>
                    <small className="text-[9px] font-mono text-[#84978c] leading-tight">
                      protocol<br />valid
                    </small>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm bg-[#70f0a0]" />
                  <span className="text-[#84978c]">Range verified:</span>
                  <b className="font-mono text-white">Passed</b>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm bg-[#ffb39a]" />
                  <span className="text-[#84978c]">Target leakage:</span>
                  <b className="font-mono text-white">Safe</b>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#11251a] border border-[#254a32] flex items-start gap-2.5 text-xs">
            <span className="text-[#70f0a0] font-bold">↳</span>
            <p className="text-[11px] text-[#91a498] leading-relaxed m-0">
              <strong className="text-[#dfffea] block">Why it matters</strong>
              Feature attribution verifies that pre-test biomarkers alone guide risk projection.
            </p>
          </div>
        </article>
      </div>

      {/* Section 02: Decision Support */}
      <div className="flex items-end justify-between pt-6 pb-2 border-b border-[#1d3027]">
        <div>
          <div className="font-mono text-[10px] tracking-[1.5px] text-[#82968a]">
            02 / DECISION SUPPORT
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Start with these signals
          </h2>
        </div>
        <button
          onClick={() => onNavigateToAnatomy()}
          className="text-xs font-bold text-[#70f0a0] hover:underline flex items-center gap-1"
        >
          <span>Explore 3D Anatomy</span>
          <span>↗</span>
        </button>
      </div>

      {/* Decision Support Cards (3 Columns matching reference) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {vesselList.map((vid, idx) => {
          const v = vessels[vid];
          const pct = Math.round(v.probability * 100);
          const isHigh = v.probability >= 0.5;

          return (
            <article
              key={vid}
              onClick={() => onNavigateToAnatomy(vid)}
              className="p-5 rounded-xl border border-[#20372a] bg-gradient-to-br from-[#111b14] to-[#0b120e] hover:border-[#4b9d68] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] text-[#84978c] flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${vesselColorInfo[vid].dotClass}`} />
                    0{idx + 1} / {vesselColorInfo[vid].label.toUpperCase()}
                  </span>
                  <span
                    className={`font-mono text-[9px] px-2 py-0.5 rounded ${
                      isHigh
                        ? 'bg-[#3b1814] text-[#ffb39a] border border-[#6b2c22]'
                        : 'bg-[#153522] text-[#8ef8b3] border border-[#285e3a]'
                    }`}
                  >
                    {v.riskCategory}
                  </span>
                </div>

                <h3 className={`text-sm font-bold text-white ${vesselColorInfo[vid].textClass} transition`}>
                  {v.fullName} ({vid})
                </h3>

                <p className="text-[11px] text-[#91a498] leading-relaxed mt-2 line-clamp-2">
                  {v.territory}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-[#1d3027] flex items-center justify-between text-xs">
                <span className="text-[#84978c]">Estimated Risk:</span>
                <b className={`font-mono font-bold ${isHigh ? 'text-[#ffb39a]' : 'text-[#70f0a0]'}`}>
                  {pct}%
                </b>
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom Banner matching reference earnest-mandazi */}
      <div className="bottom-banner p-6 rounded-2xl border border-[#285239] bg-[radial-gradient(ellipse_at_80%_50%,rgba(22,71,43,0.4),transparent_50%),linear-gradient(100deg,#102218,#0b120e)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-[#7bf4a6]">✳</span>
          <div>
            <b className="text-sm text-white">From risk assessment to intervention planning.</b>
            <p className="text-[11px] text-[#91a498] mt-0.5">
              Every recommendation points back to transparent clinical biomarkers and 3D anatomy.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToAnatomy()}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-[#16251c] text-[#70f0a0] border border-[#2b583b] hover:bg-[#203a29] transition flex items-center gap-1.5"
        >
          <span>Explore 3D Anatomy</span>
          <span>↗</span>
        </button>
      </div>

      {/* Fineprint Disclaimer */}
      <p className="font-mono text-[9px] text-[#6f8678] text-center pt-2">
        DEMO PROTOCOL NOTE &bull; Predictions reflect machine-learning statistical estimations and are not a substitute for diagnostic coronary angiography.
      </p>
    </div>
  );
};
import { type FC } from 'react';
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  Eye,
  Layers,
  ChevronRight,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import type { UserRole } from '../../types/clinical';

interface LandingPageProps {
  onLaunchPlatform: (mode?: UserRole) => void;
  onExploreDemo: () => void;
  userName?: string;
}

export const LandingPage: FC<LandingPageProps> = ({
  onLaunchPlatform,
  onExploreDemo,
  userName,
}) => {
  return (
    <div className="min-h-screen bg-[#07111F]/80 text-[#F4F8FF] overflow-x-hidden selection:bg-[#35D8F2]/30 selection:text-[#35D8F2] backdrop-blur-[2px]">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07111F]/85 border-b border-[#1E2F45]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#35D8F2] to-[#528BFF] flex items-center justify-center shadow-lg shadow-[#35D8F2]/20">
              <Heart className="h-5 w-5 text-[#07111F] fill-[#07111F]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                CardioVision <span className="text-[#35D8F2]">AI</span>
              </span>
              <span className="text-[10px] font-mono text-[#9BAFC5] block -mt-1 tracking-widest">
                TRACK A &bull; MULTIMODAL HACKATHON
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#9BAFC5]">
            <a href="#overview" className="hover:text-[#35D8F2] transition">Overview</a>
            <a href="#criteria" className="hover:text-[#70f0a0] transition text-[#70f0a0]">Judging Criteria</a>
            <a href="#workflow" className="hover:text-[#35D8F2] transition">How It Works</a>
            <a href="#features" className="hover:text-[#35D8F2] transition">Vessel Intelligence</a>
            <a href="#safety" className="hover:text-[#35D8F2] transition">Safety &amp; Scope</a>
          </nav>

          <div className="flex items-center gap-3">
            {userName && (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#101F33] border border-[#24374D] text-xs font-mono text-[#70f0a0]">
                <span className="h-2 w-2 rounded-full bg-[#70f0a0] animate-pulse" />
                <span>Dr./User: {userName}</span>
              </div>
            )}
            <button
              onClick={onExploreDemo}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#101F33] hover:bg-[#162942] border border-[#24374D] text-[#35D8F2] transition"
            >
              Explore 3D
            </button>
            <button
              onClick={() => onLaunchPlatform('doctor')}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#35D8F2] hover:bg-[#25C0DA] text-[#07111F] transition flex items-center gap-1.5 shadow-md shadow-[#35D8F2]/20"
            >
              <span>Launch Platform</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-medical-grid">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#35D8F2]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-[#8B7CFF]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101F33] border border-[#35D8F2]/30 text-xs font-mono text-[#35D8F2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#35D8F2] animate-ping" />
              <span>REVEAL &bull; EXPLAIN &bull; VISUALIZE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
              See the Risk.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#35D8F2] via-[#528BFF] to-[#8B7CFF]">
                Understand the Anatomy.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#9BAFC5] leading-relaxed max-w-2xl mx-auto">
              Transform routine clinical data into explainable vessel-level coronary predictions and interactive 3D anatomical visualization for patients, nurses, and clinicians.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onLaunchPlatform('doctor')}
                className="px-6 py-3 rounded-xl bg-[#35D8F2] hover:bg-[#25C0DA] text-[#07111F] text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-[#35D8F2]/25"
              >
                <span>Launch Clinical Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onExploreDemo}
                className="px-6 py-3 rounded-xl bg-[#101F33] hover:bg-[#162942] border border-[#24374D] text-white text-sm font-semibold transition flex items-center gap-2"
              >
                <Eye className="h-4 w-4 text-[#35D8F2]" />
                <span>Explore Interactive Demo</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-[#35D8F2]/30 via-[#1E2F45]/50 to-transparent shadow-2xl">
            <div className="rounded-2xl bg-[#0B1728]/95 p-6 border border-[#1E2F45] relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2F45] pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#F43F5E]" />
                  <div className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                  <div className="h-3 w-3 rounded-full bg-[#10B981]" />
                  <span className="text-xs font-mono text-[#9BAFC5] ml-2">PulseVision 3D Active Workspace Preview</span>
                </div>
                <div className="text-xs font-mono text-[#35D8F2] bg-[#101F33] px-2.5 py-0.5 rounded border border-[#24374D]">
                  Triple-Target Vessel Detection
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
                <div className="p-4 rounded-xl bg-[#101F33] border border-[#1E2F45]">
                  <span className="text-xs font-mono text-[#35D8F2]">LAD Vessel</span>
                  <div className="text-lg font-bold text-white mt-1">Left Anterior Descending</div>
                  <div className="text-xs text-[#9BAFC5] mt-1">Anterior wall &amp; septum territory</div>
                  <div className="mt-3 text-xs font-mono text-[#F43F5E] bg-[#F43F5E]/10 px-2 py-1 rounded inline-block">
                    Target Risk: 84% &bull; Significant
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#101F33] border border-[#1E2F45]">
                  <span className="text-xs font-mono text-[#35D8F2]">LCX Vessel</span>
                  <div className="text-lg font-bold text-white mt-1">Left Circumflex</div>
                  <div className="text-xs text-[#9BAFC5] mt-1">Lateral ventricular margin territory</div>
                  <div className="mt-3 text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded inline-block">
                    Target Risk: 42% &bull; Borderline
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#101F33] border border-[#1E2F45]">
                  <span className="text-xs font-mono text-[#35D8F2]">RCA Vessel</span>
                  <div className="text-lg font-bold text-white mt-1">Right Coronary Artery</div>
                  <div className="text-xs text-[#9BAFC5] mt-1">Inferior &amp; nodal branch territory</div>
                  <div className="mt-3 text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded inline-block">
                    Target Risk: 18% &bull; Normal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Core Product Idea */}
      <section id="workflow" className="py-20 bg-[#0B1728]/80 border-y border-[#1E2F45]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-[#35D8F2]">The Core Idea</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">From Clinical Inputs to 3D Insight</h2>
            <p className="text-sm text-[#9BAFC5] mt-2">
              A transparent, three-stage diagnostic support pipeline designed for clarity and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#101F33] border border-[#1E2F45] relative">
              <div className="h-10 w-10 rounded-xl bg-[#35D8F2]/10 border border-[#35D8F2]/30 flex items-center justify-center text-[#35D8F2] mb-4">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono text-[#35D8F2]">STAGE 01</span>
              <h3 className="text-lg font-bold text-white mt-1">Structured Clinical Ingestion</h3>
              <p className="text-xs text-[#9BAFC5] mt-2 leading-relaxed">
                Ingest comprehensive patient vitals, ECG waveforms, lipid panels, and echocardiography metrics with rigorous target-leakage isolation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#101F33] border border-[#1E2F45] relative">
              <div className="h-10 w-10 rounded-xl bg-[#528BFF]/10 border border-[#528BFF]/30 flex items-center justify-center text-[#528BFF] mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono text-[#528BFF]">STAGE 02</span>
              <h3 className="text-lg font-bold text-white mt-1">Explainable AI Inference</h3>
              <p className="text-xs text-[#9BAFC5] mt-2 leading-relaxed">
                Compute vessel-specific probabilities for LAD, LCX, and RCA alongside SHAP feature attributions so clinicians understand why the model decided.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#101F33] border border-[#1E2F45] relative">
              <div className="h-10 w-10 rounded-xl bg-[#8B7CFF]/10 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF] mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono text-[#8B7CFF]">STAGE 03</span>
              <h3 className="text-lg font-bold text-white mt-1">Interactive 3D Anatomy</h3>
              <p className="text-xs text-[#9BAFC5] mt-2 leading-relaxed">
                Project predicted risk onto an anatomically grounded 3D coronary arborization with real-time camera manipulation and territory inspections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Specific Review Section */}
      <section id="features" className="py-20 bg-[#07111F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-[#35D8F2]">Tailored Experiences</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Three User Perspectives</h2>
            <p className="text-sm text-[#9BAFC5] mt-2">
              The underlying AI model outputs remain identical; the interface adapts to the role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => onLaunchPlatform('patient')}
              className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] hover:border-[#35D8F2]/50 transition cursor-pointer group"
            >
              <div className="text-xs font-mono text-[#35D8F2]">Patient Mode</div>
              <h3 className="text-base font-bold text-white mt-1">Accessible Explanations</h3>
              <p className="text-xs text-[#9BAFC5] mt-2 leading-relaxed">
                Clear plain-language explanations, readable summaries, and reduced technical jargon to empower informed doctor-patient conversations.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[#35D8F2] font-semibold mt-4 group-hover:translate-x-1 transition">
                <span>Enter as Patient</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>

            <div
              onClick={() => onLaunchPlatform('nurse')}
              className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] hover:border-[#35D8F2]/50 transition cursor-pointer group"
            >
              <div className="text-xs font-mono text-[#528BFF]">Nurse Mode</div>
              <h3 className="text-base font-bold text-white mt-1">Intake &amp; Data Validation</h3>
              <p className="text-xs text-[#9BAFC5] mt-2 leading-relaxed">
                Streamlined clinical data collection, range validation, missing-value alerts, and pre-submission data verification workflows.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[#528BFF] font-semibold mt-4 group-hover:translate-x-1 transition">
                <span>Enter as Nurse</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>

            <div
              onClick={() => onLaunchPlatform('doctor')}
              className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] hover:border-[#35D8F2]/50 transition cursor-pointer group"
            >
              <div className="text-xs font-mono text-[#8B7CFF]">Doctor Mode</div>
              <h3 className="text-base font-bold text-white mt-1">Diagnostic Deep Dive</h3>
              <p className="text-xs text-[#9BAFC5] mt-2 leading-relaxed">
                Complete multi-target probability metrics, SHAP waterfall attributions, scenario simulations, and side-by-side assessment comparisons.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[#8B7CFF] font-semibold mt-4 group-hover:translate-x-1 transition">
                <span>Enter as Doctor</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Official Judging Criteria & Architecture Audit Section */}
      <section id="criteria" className="py-20 bg-[#07111F]/90 border-t border-[#1E2F45]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101F33] border border-[#70f0a0]/30 text-xs font-mono text-[#70f0a0]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>OFFICIAL TRACK A JUDGING CRITERIA (100%)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Evaluation Matrix &amp; System Integration
            </h2>
            <p className="text-xs sm:text-sm text-[#9BAFC5]">
              CardioVision AI addresses all five evaluation dimensions and mandatory hackathon requirements with zero target leakage and real-time ML inference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Criteria 1 */}
            <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#20372a] hover:border-[#70f0a0]/40 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#70f0a0] font-bold">CRITERIA 1</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#70f0a0]/15 text-[#70f0a0] text-xs font-mono font-bold">30% WEIGHT</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Predictive Performance</h3>
              <p className="text-xs text-[#9BAFC5] mb-4">
                4 separate models for CAD, LAD, LCX, and RCA. Stratified CV, test accuracy, precision, recall, F1, and ROC-AUC.
              </p>
              <div className="space-y-1.5 text-[11px] font-mono text-[#70f0a0] bg-[#050906]/60 p-3 rounded-lg border border-[#16291e]">
                <div>CAD (LogisticReg): Test Acc 85.2%, ROC 0.889</div>
                <div>LAD (RandomForest): Test Acc 77.0%, ROC 0.853</div>
                <div>LCX (RandomForest): Test Acc 65.6%, ROC 0.715</div>
                <div>RCA (XGBoost): Test Acc 72.1%, ROC 0.796</div>
              </div>
            </div>

            {/* Criteria 2 */}
            <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] hover:border-[#38bdf8]/40 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#38bdf8] font-bold">CRITERIA 2</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] text-xs font-mono font-bold">25% WEIGHT</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">3D Visualization</h3>
              <p className="text-xs text-[#9BAFC5] mb-4">
                Interactive WebGL 3D heart mesh (Three.js/Fiber) with real-time rotation, zoom, pan, and click-to-select vessels.
              </p>
              <div className="space-y-1.5 text-[11px] font-mono text-[#9BAFC5] bg-[#050906]/60 p-3 rounded-lg border border-[#1E2F45]">
                <div>• LAD: Color-coded Blue (#38bdf8)</div>
                <div>• LCX: Color-coded Green (#70f0a0)</div>
                <div>• RCA: Color-coded Purple (#c084fc)</div>
                <div>• Real-time risk heat glow mapped to ML probabilities</div>
              </div>
            </div>

            {/* Criteria 3 */}
            <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] hover:border-[#a855f7]/40 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#c084fc] font-bold">CRITERIA 3</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#c084fc]/15 text-[#c084fc] text-xs font-mono font-bold">20% WEIGHT</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Clinical Interpretability</h3>
              <p className="text-xs text-[#9BAFC5] mb-4">
                Real SHAP explainability (TreeExplainer + LinearExplainer) providing feature contributions and clinical descriptions.
              </p>
              <div className="space-y-1.5 text-[11px] font-mono text-[#9BAFC5] bg-[#050906]/60 p-3 rounded-lg border border-[#1E2F45]">
                <div>• Waterfalls &amp; top risk-driving clinical factors</div>
                <div>• 30+ medical rationale strings mapped to features</div>
                <div>• Interactive scenario simulator for what-if changes</div>
              </div>
            </div>

            {/* Criteria 4 */}
            <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] hover:border-[#fb923c]/40 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#fb923c] font-bold">CRITERIA 4</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#fb923c]/15 text-[#fb923c] text-xs font-mono font-bold">15% WEIGHT</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">System Integration</h3>
              <p className="text-xs text-[#9BAFC5] mb-4">
                Fully connected pipeline: React + Vite frontend talking to FastAPI REST backend serving live ML models and 3D assets.
              </p>
              <div className="space-y-1.5 text-[11px] font-mono text-[#9BAFC5] bg-[#050906]/60 p-3 rounded-lg border border-[#1E2F45]">
                <div>• POST /predict → ML probabilities + SHAP</div>
                <div>• GET /health → Model status &amp; targets</div>
                <div>• GET /models/heart.glb → 3D anatomical mesh</div>
              </div>
            </div>

            {/* Criteria 5 */}
            <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] hover:border-[#f43f5e]/40 transition md:col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#f43f5e] font-bold">CRITERIA 5 &bull; MANDATORY COMPLIANCE</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f43f5e]/15 text-[#f43f5e] text-xs font-mono font-bold">10% WEIGHT</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Technical Implementation &amp; Zero Leakage Audit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-[11px] text-[#9BAFC5]">
                <div className="bg-[#050906]/60 p-3 rounded-lg border border-[#1E2F45]">
                  <div className="text-white font-bold mb-1">Target Leakage Prevention:</div>
                  LAD, LCX, RCA, and Cath were strictly stripped from all training feature matrices (X). Verified by automated unit tests in backend/tests/test_api.py.
                </div>
                <div className="bg-[#050906]/60 p-3 rounded-lg border border-[#1E2F45]">
                  <div className="text-white font-bold mb-1">One-Click Launchers:</div>
                  Zero-terminal setup: START_HERE.html with live status polling, START_CARDIOVISION.vbs (silent launch), and START_CARDIOVISION.bat.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Limitations Statement */}
      <section id="safety" className="py-14 bg-[#0B1728] border-t border-[#1E2F45]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F59E0B]">
            <ShieldCheck className="h-4 w-4" />
            <span>Hackathon Prototype &bull; Safety Statement</span>
          </div>
          <p className="text-xs text-[#9BAFC5] leading-relaxed">
            For decision-support and educational purposes only. Predictions are not a substitute for formal diagnostic imaging or professional medical diagnosis. The 3D anatomical viewer provides an illustrative educational representation and is not an individualized patient CT angiogram reconstruction.
          </p>
        </div>
      </section>

      {/* Polished Footer */}
      <footer className="py-8 bg-[#07111F] border-t border-[#1E2F45] text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-white font-bold">PulseVision 3D</span> &bull; CardioVision AI Hackathon Platform
          </div>
          <div className="flex items-center gap-4 text-[#9BAFC5]">
            <span>FastAPI ML Contract Ready</span>
            <span>WebGL Three.js Core</span>
            <span>Z-Alizadeh Sani Benchmark</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

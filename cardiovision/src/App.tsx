import { useState } from 'react';
import type { ClinicalAssessmentData, PredictionResult, UserRole, VesselId } from './types/clinical';
import { SAMPLE_PATIENTS, generateDeterministicPrediction } from './services/demoService';
import { predictAssessment } from './services/apiService';
import { LoginPage } from './components/auth/LoginPage';
import { ClinicalWorkspaceLayout, type WorkspaceTab } from './components/layout/ClinicalWorkspaceLayout';
import { RoleSelectionModal } from './components/layout/RoleSelectionModal';
import { PatientIntakeForm } from './components/forms/PatientIntakeForm';
import { ResultsDashboard } from './components/dashboard/ResultsDashboard';
import { CoronaryAnatomyViewer } from './components/anatomy/CoronaryAnatomyViewer';
import { ExplainabilitySection } from './components/charts/ExplainabilitySection';
import { ScenarioSimulator } from './components/simulation/ScenarioSimulator';
import { AssessmentComparison } from './components/comparison/AssessmentComparison';
import { SettingsView } from './components/settings/SettingsView';
import { InsightAtmosphere } from './components/effects/InsightAtmosphere';

interface AuthUser {
  name: string;
  email: string;
  role: 'patient' | 'nurse' | 'doctor';
}

export function App() {
  // Auth state — starts at login
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Navigation & View state
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('doctor');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Clinical data & model state
  const [currentData, setCurrentData] = useState<ClinicalAssessmentData>(SAMPLE_PATIENTS[0].data);
  const [prediction, setPrediction] = useState<PredictionResult>(() =>
    generateDeterministicPrediction(SAMPLE_PATIENTS[0].data)
  );
  const [selectedVessel, setSelectedVessel] = useState<VesselId | null>(null);
  const [explainTarget, setExplainTarget] = useState<VesselId | 'CAD'>('CAD');
  const [isLoading, setIsLoading] = useState(false);

  // Baseline comparison state
  const [baselineData] = useState<ClinicalAssessmentData>(SAMPLE_PATIENTS[2].data);
  const [baselinePrediction] = useState<PredictionResult>(() =>
    generateDeterministicPrediction(SAMPLE_PATIENTS[2].data)
  );

  // Settings & Accessibility
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Handle Login — immediately routes to role-specific workspace (bypasses blue landing page)
  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    setUserRole(user.role);
    if (user.role === 'nurse') {
      setWorkspaceTab('intake');
    } else {
      setWorkspaceTab('dashboard');
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
  };

  // Handle Assessment Submission
  const handleIntakeSubmit = async (data: ClinicalAssessmentData) => {
    setIsLoading(true);
    setCurrentData(data);
    const res = await predictAssessment(data);
    setPrediction(res.result);
    setIsLoading(false);
    setWorkspaceTab('dashboard');
  };

  const handleNavigateToAnatomy = (vesselId?: VesselId) => {
    if (vesselId) setSelectedVessel(vesselId);
    setWorkspaceTab('anatomy');
  };

  const handleNavigateToExplainability = (target?: VesselId | 'CAD') => {
    if (target) setExplainTarget(target);
    setWorkspaceTab('explainability');
  };

  // ── Not logged in → show login page
  if (!authUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── Logged in → Direct Workspace Dashboard with persistent InsightFlow atmosphere
  return (
    <div
      className={`min-h-screen ${fontSize === 'large' ? 'text-[16px]' : 'text-[14px]'}`}
      style={{ position: 'relative' }}
    >
      {/* Global atmosphere from InsightFlow — aurora, falling comets, glowing trail, sparks */}
      <InsightAtmosphere />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <ClinicalWorkspaceLayout
          currentTab={workspaceTab}
          onSelectTab={setWorkspaceTab}
          userRole={userRole}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          onReturnToLanding={handleLogout}
          isDemoData={prediction.isDemoData}
          patientName={currentData.demographics.name}
          patientId={currentData.demographics.patientId}
          userEmail={authUser.email}
          userName={authUser.name}
          onLogout={handleLogout}
        >
            {workspaceTab === 'dashboard' && (
              <ResultsDashboard
                prediction={prediction}
                userRole={userRole}
                onNavigateToAnatomy={handleNavigateToAnatomy}
                onNavigateToExplainability={handleNavigateToExplainability}
                onNavigateToComparison={() => setWorkspaceTab('comparison')}
              />
            )}

            {workspaceTab === 'intake' && (
              <PatientIntakeForm
                initialData={currentData}
                onSubmit={handleIntakeSubmit}
                isLoading={isLoading}
              />
            )}

            {workspaceTab === 'anatomy' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#101a13] to-[#0b120e] border border-[#20372a]">
                  <div>
                    <h2 className="text-xl font-bold text-white">3D Coronary Arborization Visualizer</h2>
                    <p className="text-xs text-[#84978c] mt-1">
                      Anatomically grounded 3D model: <span className="text-[#38bdf8] font-bold">LAD (Blue)</span>, <span className="text-[#70f0a0] font-bold">LCX (Green)</span>, <span className="text-[#c084fc] font-bold">RCA (Purple)</span>.
                    </p>
                  </div>
                  <button
                    onClick={() => setWorkspaceTab('explainability')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#132319] hover:bg-[#1a3324] border border-[#285239] text-[#70f0a0] text-xs font-mono font-medium transition"
                  >
                    View Feature Attributions →
                  </button>
                </div>
                <CoronaryAnatomyViewer
                  vesselPredictions={prediction.vessels}
                  selectedVessel={selectedVessel}
                  onSelectVessel={setSelectedVessel}
                  userRole={userRole}
                />
              </div>
            )}

            {workspaceTab === 'explainability' && (
              <ExplainabilitySection
                prediction={prediction}
                userRole={userRole}
                selectedTarget={explainTarget}
                onSelectTarget={setExplainTarget}
              />
            )}

            {workspaceTab === 'simulation' && (
              <ScenarioSimulator
                baselineData={currentData}
                baselinePrediction={prediction}
                onApplyScenario={handleIntakeSubmit}
              />
            )}

            {workspaceTab === 'comparison' && (
              <AssessmentComparison
                assessmentA={{ data: currentData, prediction, title: `Current (${currentData.demographics.name})` }}
                assessmentB={{ data: baselineData, prediction: baselinePrediction, title: `Baseline (${baselineData.demographics.name})` }}
              />
            )}

            {workspaceTab === 'settings' && (
              <SettingsView
                fontSize={fontSize}
                setFontSize={setFontSize}
                reducedMotion={reducedMotion}
                setReducedMotion={setReducedMotion}
              />
            )}
          </ClinicalWorkspaceLayout>
      </div>

      {isRoleModalOpen && (
        <RoleSelectionModal
          currentRole={userRole}
          onSelectRole={(r) => { setUserRole(r); setIsRoleModalOpen(false); }}
          onClose={() => setIsRoleModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;

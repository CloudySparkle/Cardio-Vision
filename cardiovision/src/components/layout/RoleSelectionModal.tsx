import { type FC, type ReactNode } from 'react';
import type { UserRole } from '../../types/clinical';
import { User, Stethoscope, Activity, ArrowRight, Info } from 'lucide-react';

interface RoleSelectionModalProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onClose?: () => void;
}

export const RoleSelectionModal: FC<RoleSelectionModalProps> = ({
  currentRole,
  onSelectRole,
  onClose,
}) => {
  const roles: {
    id: UserRole;
    title: string;
    badge: string;
    icon: ReactNode;
    description: string;
    features: string[];
  }[] = [
    {
      id: 'patient',
      title: 'Patient Mode',
      badge: 'Accessible Insights',
      icon: <User className="h-6 w-6 text-[#35D8F2]" />,
      description: 'Designed for patients and families seeking clear, plain-language cardiovascular risk explanations.',
      features: [
        'Plain-language risk summaries',
        'Intuitive 3D heart exploration',
        'Reduced medical jargon',
        'Personalized discussion questions for your cardiologist',
      ],
    },
    {
      id: 'nurse',
      title: 'Nurse Mode',
      badge: 'Intake & Validation',
      icon: <Activity className="h-6 w-6 text-[#528BFF]" />,
      description: 'Streamlined clinical data collection with rapid input validation and triage assistance.',
      features: [
        'Structured clinical input checklists',
        'Automated physiological range validation',
        'Missing value alerts before submission',
        'Clinical triage summary notes',
      ],
    },
    {
      id: 'doctor',
      title: 'Doctor Mode',
      badge: 'Full Diagnostic Deep Dive',
      icon: <Stethoscope className="h-6 w-6 text-[#8B7CFF]" />,
      description: 'Comprehensive multi-vessel probability predictions, SHAP feature attributions, and what-if sensitivity simulations.',
      features: [
        'Multi-target coronary predictions (CAD, LAD, LCX, RCA)',
        'Explainable AI SHAP waterfall charts',
        'Interactive scenario simulation engine',
        'Multi-case comparative analysis',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07111F]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-[#0B1728] border border-[#1E2F45] shadow-2xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101F33] border border-[#35D8F2]/30 text-[11px] font-mono text-[#35D8F2]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#35D8F2] animate-ping" />
            <span>DEMO SESSION &bull; NO REAL PHI STORED</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-2">Select Your Platform Perspective</h2>
          <p className="text-xs sm:text-sm text-[#9BAFC5] mt-1">
            Choose your role to tailor the workspace information density and clinical detail level. The underlying predictive calculations remain identical.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="space-y-3">
          {roles.map((r) => {
            const isSelected = currentRole === r.id;
            return (
              <div
                key={r.id}
                onClick={() => {
                  onSelectRole(r.id);
                  if (onClose) onClose();
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-[#102238] border-[#35D8F2] shadow-lg shadow-[#35D8F2]/10'
                    : 'bg-[#101F33]/60 border-[#1E2F45] hover:border-[#35D8F2]/40 hover:bg-[#101F33]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#24374D] shrink-0">
                    {r.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{r.title}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#162942] text-[#35D8F2] border border-[#35D8F2]/30">
                        {r.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#9BAFC5] mt-1 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 self-end sm:self-center ${
                    isSelected
                      ? 'bg-[#35D8F2] text-[#07111F]'
                      : 'bg-[#162942] text-white hover:bg-[#1E3657]'
                  }`}
                >
                  <span>{isSelected ? 'Active' : 'Select'}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Demo Disclaimer */}
        <div className="p-3.5 rounded-xl bg-[#07111F] border border-[#1E2F45] flex items-center gap-2 text-xs text-[#9BAFC5]">
          <Info className="h-4 w-4 text-[#35D8F2] shrink-0" />
          <span>Demo sessions operate on local state or connected test backends. Do not enter real patient identifying information.</span>
        </div>
      </div>
    </div>
  );
};

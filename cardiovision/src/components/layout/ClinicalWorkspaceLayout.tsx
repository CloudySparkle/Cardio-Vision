import { useState, type FC, type ReactNode } from 'react';
import type { UserRole } from '../../types/clinical';
import {
  Menu,
  User,
  Activity,
  Stethoscope,
} from 'lucide-react';

export type WorkspaceTab =
  | 'dashboard'
  | 'intake'
  | 'anatomy'
  | 'explainability'
  | 'simulation'
  | 'comparison'
  | 'settings';

interface ClinicalWorkspaceLayoutProps {
  currentTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  userRole: UserRole;
  onOpenRoleModal: () => void;
  onReturnToLanding: () => void;
  isDemoData: boolean;
  patientName: string;
  patientId: string;
  userEmail?: string;
  userName?: string;
  onLogout?: () => void;
  children: ReactNode;
}

export const ClinicalWorkspaceLayout: FC<ClinicalWorkspaceLayoutProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onOpenRoleModal,
  onReturnToLanding,
  isDemoData: _isDemoData,
  patientName,
  patientId,
  userEmail,
  userName,
  onLogout,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems: { id: WorkspaceTab; label: string; icon: string; kbd: string }[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: '◈',
      kbd: '01',
    },
    {
      id: 'intake',
      label: 'Patient Intake',
      icon: '▤',
      kbd: '02',
    },
    {
      id: 'anatomy',
      label: '3D Coronary Anatomy',
      icon: '◎',
      kbd: '03',
    },
    {
      id: 'explainability',
      label: 'Risk & SHAP Radar',
      icon: '↗',
      kbd: '04',
    },
    {
      id: 'simulation',
      label: 'What-If Simulator',
      icon: '▦',
      kbd: '05',
    },
    {
      id: 'comparison',
      label: 'Compare Assessments',
      icon: '⌁',
      kbd: '06',
    },
    {
      id: 'settings',
      label: 'Diagnostics & Status',
      icon: '⚙',
      kbd: '07',
    },
  ];

  const getRoleBadge = () => {
    if (userRole === 'patient') {
      return {
        label: 'Patient View',
        icon: <User className="h-3 w-3" />,
        color: 'border-[#70f0a0]/30 text-[#70f0a0]',
      };
    }
    if (userRole === 'nurse') {
      return {
        label: 'Nurse Triage',
        icon: <Activity className="h-3 w-3" />,
        color: 'border-[#50e58d]/30 text-[#50e58d]',
      };
    }
    return {
      label: 'Doctor Review',
      icon: <Stethoscope className="h-3 w-3" />,
      color: 'border-[#70f0a0]/30 text-[#70f0a0]',
    };
  };

  const roleInfo = getRoleBadge();
  const currentNavItem = navItems.find((n) => n.id === currentTab) || navItems[0];

  return (
    <div className="min-h-screen bg-transparent text-[#edf6ef] flex flex-col md:flex-row antialiased relative z-10">
      {/* Sidebar matching reference earnest-mandazi-96b590 */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 transition-all duration-300 flex flex-col justify-between border-r border-[#1d3027] bg-[#070c09]/95 md:bg-[rgba(5,10,7,0.92)] backdrop-blur-xl ${
          sidebarOpen ? 'w-[242px]' : 'w-20'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 pt-5 pb-6 flex items-center justify-between border-b border-[#1d3027]/60">
            <div
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden select-none"
              onClick={onReturnToLanding}
            >
              <div className="w-9 h-9 rounded-xl border border-[#70f0a0] text-[#70f0a0] flex items-center justify-center font-black text-lg rotate-[-5deg] shadow-[0_0_24px_rgba(112,240,160,0.18)] shrink-0">
                p<span className="text-[#ffb39a]">v</span>
              </div>
              {sidebarOpen && (
                <div className="truncate">
                  <div className="font-extrabold text-[15px] tracking-tight text-[#f0fff5]">
                    pulse<span className="text-[#70f0a0]">vision</span>
                  </div>
                  <small className="block font-mono text-[9px] tracking-[1.4px] text-[#84978c]">
                    VOICE → DECISIONS
                  </small>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-[#84978c] hover:text-[#70f0a0] hover:bg-[#101b13] hidden md:block transition"
              title="Toggle Sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          {/* Section Eyebrow Label */}
          {sidebarOpen && (
            <div className="px-4 pt-4 pb-2 text-[10px] font-mono tracking-[1.5px] text-[#82968a]">
              WORKSPACE
            </div>
          )}

          {/* Nav Items with <kbd> tags */}
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#173b28] to-[#102017] border border-[#28583b] text-[#a6ffc4] shadow-[inset_2px_0_#70f0a0]'
                      : 'text-[#9aaea2] hover:bg-[#101d14] hover:text-[#70f0a0] hover:translate-x-1 border border-transparent'
                  }`}
                  title={item.label}
                >
                  <span className={`text-base w-4 text-center ${isActive ? 'text-[#70f0a0]' : 'text-[#7c9083] group-hover:text-[#70f0a0]'}`}>
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <>
                      <span className="truncate">{item.label}</span>
                      <kbd className="ml-auto font-mono text-[9px] text-[#6b7e72] px-1.5 py-0.5 rounded bg-[#0b140e] border border-[#1d3027] group-hover:border-[#2b4c37]">
                        {item.kbd}
                      </kbd>
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Cards */}
        <div className="p-3 border-t border-[#1d3027] space-y-3">
          {sidebarOpen && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#21412f] bg-gradient-to-br from-[#101d15] to-[#0b110d]">
              <span className="w-2 h-2 rounded-full bg-[#70f0a0] shadow-[0_0_10px_#70f0a0] animate-pulse shrink-0" />
              <div className="truncate">
                <div className="text-[11px] font-bold text-white">Data Pipeline</div>
                <div className="text-[9px] font-mono text-[#84978c] truncate">
                  ML Inference: Demo Active
                </div>
              </div>
              <span className="ml-auto text-[11px] text-[#70f0a0]">↗</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-1">
            <div className="w-8 h-8 rounded-lg bg-[#70f0a0] text-[#06130a] font-extrabold text-xs grid place-items-center shrink-0">
              PV
            </div>
            {sidebarOpen ? (
              <div className="truncate flex-1">
                <div className="text-[11px] font-bold text-white truncate">{patientName}</div>
                <div className="text-[9px] font-mono text-[#84978c] truncate">
                  {patientId} &bull; {roleInfo.label}
                </div>
              </div>
            ) : null}
            {sidebarOpen && (
              <button
                onClick={onOpenRoleModal}
                className="p-1 rounded text-[#84978c] hover:text-[#70f0a0] transition"
                title="Switch Clinical Role"
              >
                &bull;&bull;&bull;
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar with Breadcrumb & Live status */}
        <header className="h-[68px] border-b border-[#1d3027] bg-[#050906]/90 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-[#84978c] hover:text-[#70f0a0] md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb matching earnest-mandazi */}
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-[#82968a]">
              <span>WORKSPACE</span>
              <span className="text-[#3c4e43]">/</span>
              <b className="text-[#edf6ef] font-medium">{currentNavItem.label}</b>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            {userEmail ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101f16]/90 border border-[#234533] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#70f0a0] shadow-[0_0_8px_#70f0a0] animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[11px] leading-tight truncate max-w-[190px]" title={userEmail}>
                    {userName || userEmail}
                  </span>
                  <span className="text-[#84978c] text-[9px] font-mono leading-tight truncate max-w-[190px]">
                    {userEmail} &bull; <span className="text-[#70f0a0] uppercase">{userRole}</span>
                  </span>
                </div>
              </div>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#70f0a0] shadow-[0_0_8px_#70f0a0]" />
                <span className="font-mono text-[9px] tracking-wider text-[#82968a] hidden sm:inline">
                  LOCAL DEMO
                </span>
              </>
            )}

            <button
              onClick={() => onSelectTab('intake')}
              className="w-8 h-8 rounded-lg bg-[#101a13] border border-[#20372a] text-[#70f0a0] hover:border-[#70f0a0] flex items-center justify-center text-sm font-bold transition"
              title="Import New Assessment"
            >
              ⇧
            </button>

            <button
              onClick={onOpenRoleModal}
              className="w-8 h-8 rounded-full bg-[#70f0a0] text-[#06130a] font-black text-xs grid place-items-center hover:opacity-90 transition shadow-[0_0_15px_rgba(112,240,160,0.3)]"
              title={`Active: ${roleInfo.label} (Click to switch)`}
            >
              {userRole === 'doctor' ? 'DR' : userRole === 'nurse' ? 'RN' : 'PT'}
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-[#1a0f0f]/90 border border-[#4a1c1c] text-[#f87171] hover:bg-[#2e1414] hover:border-[#ef4444] transition"
                title="Sign out to login screen"
              >
                Sign Out
              </button>
            )}
          </div>
        </header>

        {/* Dynamic View Container */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
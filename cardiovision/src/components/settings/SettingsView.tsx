import { useState, useEffect, type FC } from 'react';
import type { ApiHealthStatus } from '../../types/clinical';
import { checkApiHealth } from '../../services/apiService';
import {
  Settings,
  Shield,
  Server,
  RefreshCw,
  CheckCircle,
  XCircle,
  Sliders,
} from 'lucide-react';

interface SettingsViewProps {
  fontSize: 'normal' | 'large';
  setFontSize: (size: 'normal' | 'large') => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
}

export const SettingsView: FC<SettingsViewProps> = ({
  fontSize,
  setFontSize,
  reducedMotion,
  setReducedMotion,
}) => {
  const [apiStatus, setApiStatus] = useState<ApiHealthStatus | null>(null);
  const [isCheckingApi, setIsCheckingApi] = useState<boolean>(false);

  const testConnection = async () => {
    setIsCheckingApi(true);
    const status = await checkApiHealth();
    setApiStatus(status);
    setIsCheckingApi(false);
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0B1728] border border-[#1E2F45]">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-[#35D8F2]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#35D8F2]">
            System Preferences
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1">Platform Settings &amp; Diagnostics</h2>
        <p className="text-xs text-[#9BAFC5] mt-1 max-w-2xl">
          Configure clinical display preferences, inspect backend API readiness, and review safety guardrails.
        </p>
      </div>

      {/* Accessibility & Interface Preferences */}
      <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-[#1E2F45] pb-3 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#35D8F2]" />
          Accessibility &amp; Visual Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Typography Scale */}
          <div className="p-4 rounded-xl bg-[#101F33] border border-[#1E2F45] space-y-2">
            <span className="text-xs font-semibold text-white block">Clinical Typography Scale</span>
            <p className="text-[11px] text-[#9BAFC5]">
              Adjust text scale for intensive clinical review or patient consultation.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                  fontSize === 'normal'
                    ? 'bg-[#35D8F2] text-[#07111F] font-bold'
                    : 'bg-[#162942] text-[#9BAFC5] hover:text-white'
                }`}
              >
                Standard (14px)
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                  fontSize === 'large'
                    ? 'bg-[#35D8F2] text-[#07111F] font-bold'
                    : 'bg-[#162942] text-[#9BAFC5] hover:text-white'
                }`}
              >
                High Legibility (16px)
              </button>
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="p-4 rounded-xl bg-[#101F33] border border-[#1E2F45] space-y-2">
            <span className="text-xs font-semibold text-white block">Motion &amp; GPU Animation</span>
            <p className="text-[11px] text-[#9BAFC5]">
              Disable heartbeat contraction pulses and viewport transitions for reduced GPU load.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setReducedMotion(false)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                  !reducedMotion
                    ? 'bg-[#35D8F2] text-[#07111F] font-bold'
                    : 'bg-[#162942] text-[#9BAFC5] hover:text-white'
                }`}
              >
                Full Dynamic Effects
              </button>
              <button
                type="button"
                onClick={() => setReducedMotion(true)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                  reducedMotion
                    ? 'bg-[#35D8F2] text-[#07111F] font-bold'
                    : 'bg-[#162942] text-[#9BAFC5] hover:text-white'
                }`}
              >
                Reduced Motion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backend API Diagnostics */}
      <div className="p-6 rounded-2xl bg-[#0B1728] border border-[#1E2F45] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2F45] pb-3">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Server className="h-4 w-4 text-[#35D8F2]" />
            FastAPI Inference Backend Diagnostics
          </h3>

          <button
            onClick={testConnection}
            disabled={isCheckingApi}
            className="px-3 py-1.5 rounded-lg bg-[#162942] hover:bg-[#1E3657] border border-[#24374D] text-[#35D8F2] text-xs font-mono font-medium flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCheckingApi ? 'animate-spin' : ''}`} />
            <span>Ping Backend</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#101F33] border border-[#1E2F45] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9BAFC5]">Configured API Base URL:</span>
            <span className="font-mono text-white bg-[#07111F] px-2.5 py-1 rounded border border-[#24374D]">
              {apiStatus?.baseUrl || 'http://localhost:8000'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9BAFC5]">Connection Status:</span>
            <span
              className={`font-mono font-bold flex items-center gap-1.5 ${
                apiStatus?.online ? 'text-[#10B981]' : 'text-[#F59E0B]'
              }`}
            >
              {apiStatus?.online ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Live Backend Online
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" /> Offline &mdash; Local Deterministic Simulation Active
                </>
              )}
            </span>
          </div>

          <div className="pt-2 border-t border-[#1E2F45] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            {[
              { name: 'POST /predict', active: apiStatus?.endpoints.predict },
              { name: 'POST /explain', active: apiStatus?.endpoints.explain },
              { name: 'GET /health', active: apiStatus?.endpoints.health },
              { name: 'GET /model-info', active: apiStatus?.endpoints.modelInfo },
            ].map((ep) => (
              <div
                key={ep.name}
                className={`p-2 rounded-lg border flex items-center justify-between ${
                  ep.active
                    ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                    : 'bg-[#07111F] border-[#24374D] text-[#64748B]'
                }`}
              >
                <span>{ep.name}</span>
                <span>{ep.active ? 'Ready' : 'Offline'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety & Medical Disclaimer */}
      <div className="p-6 rounded-2xl bg-[#081220] border border-[#24374D] space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Shield className="h-5 w-5 text-[#35D8F2]" />
          <span>Regulatory &amp; Medical Disclaimer</span>
        </div>
        <p className="text-xs text-[#9BAFC5] leading-relaxed">
          PulseVision 3D / CardioVision AI is a hackathon prototype designed for scientific visualization, clinical education, and decision-support research. The machine learning models and 3D coronary representations are trained on benchmark retrospective cohort datasets (Z-Alizadeh Sani CAD database) and have not received regulatory clearance (FDA 510(k), CE-MDR) for autonomous clinical diagnostic application.
        </p>
        <p className="text-xs text-[#9BAFC5] leading-relaxed">
          Predictions are not a substitute for formal diagnostic imaging (catheter coronary angiography, CCTA) or direct clinical evaluation by a licensed cardiologist.
        </p>
      </div>
    </div>
  );
};

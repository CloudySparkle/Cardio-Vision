import { useState, type FC, type FormEvent } from 'react';
import {
  Heart,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  ArrowRight,
  Lock,
  User,
  Mail,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { InsightAtmosphere } from '../effects/InsightAtmosphere';
import { loginWithCredentials, loginWithGoogleOAuth } from '../../services/apiService';

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; role: 'patient' | 'nurse' | 'doctor'; token?: string }) => void;
}

interface GoogleAccount {
  name: string;
  email: string;
  avatarText: string;
  desc: string;
}

const INITIAL_GOOGLE_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Dr. Arjun Sharma',
    email: 'arjun.sharma.cardio@gmail.com',
    avatarText: 'AS',
    desc: 'Chief Interventional Cardiologist • AIIMS New Delhi',
  },
  {
    name: 'Dr. Priya Patel',
    email: 'priya.patel.md@gmail.com',
    avatarText: 'PP',
    desc: 'Cardiovascular Specialist • Medanta Heart Institute',
  },
  {
    name: 'Clinical Investigator',
    email: 'cardio.fellow@stanford.edu',
    avatarText: 'CI',
    desc: 'Cardiovascular ML Research Fellow',
  },
];

export const LoginPage: FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor' as 'patient' | 'nurse' | 'doctor',
  });

  // Google accounts loaded from localStorage
  const [googleAccounts, setGoogleAccounts] = useState<GoogleAccount[]>(() => {
    try {
      const stored = localStorage.getItem('cv_saved_google_accounts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_GOOGLE_ACCOUNTS;
  });

  // Google OAuth Account Chooser Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'signup' && !form.name) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const res = await loginWithCredentials(form.email, form.password, form.role, form.name);
    setIsLoading(false);

    if (!res.success && res.error) {
      setError(res.error);
      return;
    }

    onLogin({
      name: res.user.name,
      email: res.user.email,
      role: res.user.role,
      token: res.user.token,
    });
  };

  // Google account selected from chooser
  const handleSelectGoogleAccount = async (account: { name: string; email: string }) => {
    setGoogleLoading(true);
    setGoogleError('');

    // Save to accounts list if not already present
    setGoogleAccounts((prev) => {
      const exists = prev.some((a) => a.email.toLowerCase() === account.email.toLowerCase());
      if (!exists) {
        const initials = account.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'MD';
        const updated = [
          {
            name: account.name,
            email: account.email,
            avatarText: initials,
            desc: 'Authorized Clinical Google Account',
          },
          ...prev,
        ];
        try {
          localStorage.setItem('cv_saved_google_accounts', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      }
      return prev;
    });

    try {
      const res = await loginWithGoogleOAuth(form.role, account.email, account.name);
      setGoogleLoading(false);
      setIsGoogleModalOpen(false);

      onLogin({
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        token: res.user.token,
      });
    } catch {
      setGoogleLoading(false);
      setGoogleError('Failed to authenticate with chosen Google account.');
    }
  };

  const handleCustomGoogleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customGoogleEmail)) {
      setGoogleError('Please enter a valid Google email address.');
      return;
    }
    const derivedName =
      customGoogleName ||
      customGoogleEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    handleSelectGoogleAccount({ name: derivedName, email: customGoogleEmail });
  };

  const ROLES = [
    { id: 'patient' as const, label: 'Patient', icon: '🫀', desc: 'View my risk profile' },
    { id: 'nurse' as const, label: 'Nurse', icon: '🩺', desc: 'Enter & review data' },
    { id: 'doctor' as const, label: 'Doctor', icon: '👨‍⚕️', desc: 'Full clinical view' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050906', position: 'relative', overflowX: 'hidden' }}>
      {/* Exact InsightFlow ambient atmosphere: ribbons, comet particles, connected line trail, sparks */}
      <InsightAtmosphere />

      {/* Subtle vignette */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          background:
            'radial-gradient(ellipse at 50% 15%, rgba(20,80,45,0.3) 0%, transparent 65%), radial-gradient(ellipse at 80% 80%, rgba(10,50,30,0.18) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '470px' }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(112,240,160,0.22), rgba(40,160,90,0.15))',
                border: '1px solid rgba(112,240,160,0.4)',
                boxShadow: '0 0 32px rgba(112,240,160,0.25)',
                marginBottom: '16px',
              }}
            >
              <Heart size={30} color="#70f0a0" fill="#70f0a0" />
            </div>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#4ade80',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              ● LIVE · REVEAL · EXPLAIN · VISUALIZE
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
              Cardio<span style={{ color: '#70f0a0' }}>Vision</span> AI
            </h1>
            <p style={{ fontSize: '12px', color: '#84978c', marginTop: '4px' }}>
              Multimodal Hackathon — Track A · Cardiovascular Risk Visualization
            </p>
          </div>

          {/* Authentication Card */}
          <div
            style={{
              background: 'rgba(13, 20, 17, 0.94)',
              border: '1px solid rgba(45, 100, 65, 0.65)',
              borderRadius: '20px',
              padding: '30px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(112,240,160,0.08)',
            }}
          >
            {/* Tab switcher */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(5,9,6,0.85)',
                borderRadius: '10px',
                padding: '3px',
                marginBottom: '22px',
              }}
            >
              {(['login', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setMode(tab);
                    setError('');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: mode === tab ? 'rgba(112,240,160,0.15)' : 'transparent',
                    color: mode === tab ? '#70f0a0' : '#84978c',
                    boxShadow: mode === tab ? '0 0 12px rgba(112,240,160,0.1)' : 'none',
                  }}
                >
                  {tab === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* Google Login Trigger (Opens Account Selection Dialog) */}
            <button
              onClick={() => {
                setError('');
                setIsGoogleModalOpen(true);
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '11px',
                marginBottom: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: '10px',
                color: '#f0f0f0',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(45,80,60,0.5)' }} />
              <span style={{ fontSize: '11px', color: '#4a6655', fontFamily: 'monospace' }}>OR SIGN IN MANUALLY</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(45,80,60,0.5)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      fontSize: '11px',
                      color: '#70f0a0',
                      fontFamily: 'monospace',
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    FULL NAME
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={14}
                      color="#4a6655"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      type="text"
                      placeholder="Dr. John Smith"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    color: '#70f0a0',
                    fontFamily: 'monospace',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  EMAIL ADDRESS
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={14}
                    color="#4a6655"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="email"
                    placeholder="doctor@hospital.org"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    color: '#70f0a0',
                    fontFamily: 'monospace',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={14}
                    color="#4a6655"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    style={{ ...inputStyle, paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPass ? <EyeOff size={14} color="#4a6655" /> : <Eye size={14} color="#4a6655" />}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    color: '#70f0a0',
                    fontFamily: 'monospace',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  ACCESS ROLE
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: r.id }))}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: form.role === r.id ? 'rgba(112,240,160,0.15)' : 'rgba(5,9,6,0.6)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: form.role === r.id ? 'rgba(112,240,160,0.5)' : 'rgba(40,70,50,0.6)',
                        color: form.role === r.id ? '#70f0a0' : '#84978c',
                        fontSize: '11px',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                        boxShadow: form.role === r.id ? '0 0 12px rgba(112,240,160,0.15)' : 'none',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{r.icon}</div>
                      <div>{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(244,63,94,0.1)',
                    border: '1px solid rgba(244,63,94,0.3)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '14px',
                    color: '#f43f5e',
                    fontSize: '12px',
                  }}
                >
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isLoading
                    ? 'rgba(112,240,160,0.2)'
                    : 'linear-gradient(135deg, #70f0a0, #2db96e)',
                  color: '#050906',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(112,240,160,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {isLoading ? (
                  <>
                    <Activity size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Authenticating with Backend...
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In to CardioVision Platform' : 'Create Clinical Account'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Safety disclaimer */}
          <div
            style={{
              marginTop: '18px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#3d5e4a',
              fontSize: '11px',
            }}
          >
            <ShieldCheck size={13} color="#2d7a4f" />
            Research & educational decision-support prototype. Not for clinical diagnosis.
          </div>

          {/* Official Judging Criteria Matrix */}
          <div
            style={{
              marginTop: '18px',
              background: 'rgba(8,14,10,0.85)',
              border: '1px solid rgba(40,80,55,0.5)',
              borderRadius: '14px',
              padding: '16px 20px',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: '#70f0a0',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                marginBottom: '10px',
              }}
            >
              ⚡ HACKATHON TRACK A — EVALUATION CRITERIA (100%)
            </div>
            {[
              { label: 'Predictive Performance', pct: 30, color: '#70f0a0' },
              { label: '3D Visualization', pct: 25, color: '#43e58d' },
              { label: 'Clinical Interpretability', pct: 20, color: '#38bdf8' },
              { label: 'System Integration', pct: 15, color: '#c084fc' },
              { label: 'Technical Implementation', pct: 10, color: '#fb923c' },
            ].map((c) => (
              <div key={c.label} style={{ marginBottom: '7px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#9bafc5' }}>{c.label}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: c.color, fontWeight: 700 }}>
                    {c.pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: '4px',
                    background: 'rgba(40,70,50,0.4)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(c.pct * 100) / 30}%`,
                      background: `linear-gradient(90deg, ${c.color}88, ${c.color})`,
                      borderRadius: '2px',
                      boxShadow: `0 0 6px ${c.color}66`,
                    }}
                  />
                </div>
              </div>
            ))}
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(40,70,50,0.4)' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  'CAD+LAD+LCX+RCA Targets',
                  'Zero Target Leakage',
                  'Interactive 3D Heart',
                  'SHAP Explainability',
                ].map((req) => (
                  <span
                    key={req}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      padding: '2px 7px',
                      background: 'rgba(112,240,160,0.08)',
                      border: '1px solid rgba(112,240,160,0.2)',
                      borderRadius: '4px',
                      color: '#70f0a0',
                      fontFamily: 'monospace',
                    }}
                  >
                    <CheckCircle2 size={9} />
                    {req}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── GOOGLE ACCOUNT CHOOSER MODAL (Authentic OAuth Dialog) ── */}
      {isGoogleModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !googleLoading) {
              setIsGoogleModalOpen(false);
            }
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '430px',
              background: '#ffffff',
              borderRadius: '16px',
              color: '#1f1f1f',
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              animation: 'modalSlideUp 0.22s ease-out',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '14px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <button
                  onClick={() => setIsGoogleModalOpen(false)}
                  disabled={googleLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    marginLeft: 'auto',
                    padding: '4px',
                    borderRadius: '50%',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Choose an account
              </h2>
              <p style={{ fontSize: '13px', color: '#4b5563', margin: '4px 0 0' }}>
                to continue to <span style={{ fontWeight: 600, color: '#16a34a' }}>CardioVision AI</span>
              </p>
            </div>

            {/* Error in modal if any */}
            {googleError && (
              <div
                style={{
                  margin: '12px 24px 0',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '12px',
                }}
              >
                {googleError}
              </div>
            )}

            {/* Google ID Direct Input Box */}
            <form onSubmit={handleCustomGoogleSubmit} style={{ padding: '16px 24px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                Sign in with your Google Email ID:
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px' }}>
                Enter your own personal or hospital Google ID:
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="email"
                  placeholder="e.g. dr.yourname@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#ffffff',
                  }}
                />
                <button
                  type="submit"
                  disabled={googleLoading}
                  style={{
                    padding: '9px 16px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: googleLoading ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(16,185,129,0.3)',
                  }}
                >
                  {googleLoading ? 'Signing in...' : 'Sign In with ID →'}
                </button>
              </div>
              <input
                type="text"
                placeholder="Doctor / Clinician Full Name (Optional)"
                value={customGoogleName}
                onChange={(e) => setCustomGoogleName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  color: '#334155',
                  background: '#ffffff',
                }}
              />
            </form>

            <div style={{ padding: '10px 24px 4px', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Or choose a saved / demo clinician ID:
            </div>

            {/* Account List */}
            <div style={{ padding: '4px 0 8px', maxHeight: '250px', overflowY: 'auto' }}>
              {googleAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => !googleLoading && handleSelectGoogleAccount(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 24px',
                    cursor: googleLoading ? 'wait' : 'pointer',
                    transition: 'background 0.15s',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Google style circle avatar */}
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    {acc.avatarText}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{acc.name}</div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#475569',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {acc.email}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{acc.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                background: '#f9fafb',
                borderTop: '1px solid #e5e7eb',
                fontSize: '11px',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>CardioVision will access your email and name</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>FastAPI Verified</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0d1411 inset !important;
          -webkit-text-fill-color: #edf6ef !important;
        }
      `}</style>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px 11px 36px',
  background: 'rgba(5,9,6,0.85)',
  border: '1px solid rgba(40,80,55,0.5)',
  borderRadius: '10px',
  color: '#edf6ef',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
};

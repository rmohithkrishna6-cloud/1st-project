import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { loginUser, registerUser, requestForgotPassword, resetPassword } from '../services/api';
import { DeveloperProfileView } from './DeveloperProfileView';
import { X, Mail, LogIn, Lock, Eye, EyeOff, UserCheck, KeyRound, Check, AlertCircle, ArrowLeft } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, user } = useAppStore();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailConfirmedNotice, setEmailConfirmedNotice] = useState<string | null>(null);
  const [welcomeNotice, setWelcomeNotice] = useState<string | null>(null);
  const [isResetStep, setIsResetStep] = useState(false);

  if (!isAuthModalOpen) return null;

  const resetState = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmailConfirmedNotice(null);
  };

  const handleSwitchMode = (mode: 'login' | 'register' | 'forgot') => {
    setAuthMode(mode);
    resetState();
    setIsResetStep(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your registered email address and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(email.trim(), password);
      if (data.token) {
        localStorage.setItem('nexora_token', data.token);
      }
      setUser(data.user);
      setWelcomeNotice(`🎉 Welcome back, ${data.user.displayName}! Daily Streak Active 🔥`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Only registered accounts can log in.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(email.trim(), password, confirmPassword, displayName.trim());
      if (data.token) {
        localStorage.setItem('nexora_token', data.token);
      }
      setUser(data.user);
      setWelcomeNotice(`🎉 Account created! Welcome, ${data.user.displayName}. Your streak begins today 🔥`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestForgotPassword(email.trim());
      setSuccessMsg(`✉️ Password reset method sent to your registered email (${res.email}). Enter your new password below.`);
      setIsResetStep(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'No registered account found with this email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();

    if (!password || password.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('New password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email.trim(), password, confirmPassword);
      setSuccessMsg(res.message || 'Password changed successfully! Please log in with your new password.');
      setTimeout(() => {
        setAuthMode('login');
        setIsResetStep(false);
        setPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setWelcomeNotice(null);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`glass-box w-full p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-white/15 bg-[#0B1A12]/95 max-h-[92vh] overflow-y-auto ${
          user ? 'max-w-2xl sm:max-w-3xl' : 'max-w-md'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setWelcomeNotice(null);
          }}
          className="absolute top-6 right-6 neo-inset p-2 rounded-xl text-white/50 hover:text-white transition-colors z-20"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* Profile Logged-In View */
          <DeveloperProfileView
            onLogout={handleLogout}
            onClose={() => {
              setIsAuthModalOpen(false);
              setWelcomeNotice(null);
            }}
            welcomeNotice={welcomeNotice}
          />
        ) : (
          /* Auth Forms: Login / Register / Forgot Password */
          <div>
            {/* Header Title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#B4FF00] text-[#0B1A12] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(180,255,0,0.4)]">
                {authMode === 'register' ? (
                  <UserCheck className="w-5 h-5" />
                ) : authMode === 'forgot' ? (
                  <KeyRound className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {authMode === 'register'
                    ? 'Register Account'
                    : authMode === 'forgot'
                    ? 'Password Recovery'
                    : 'Developer Sign In'}
                </h2>
                <p className="text-xs text-white/50">
                  {authMode === 'register'
                    ? 'Create your Nexora account to run & sync code'
                    : authMode === 'forgot'
                    ? 'Reset password for your registered email'
                    : 'Sign in with registered account email & password'}
                </p>
              </div>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex items-center bg-[#0E2117] p-1 rounded-xl border border-white/10 neo-inset mb-5">
              <button
                onClick={() => handleSwitchMode('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_10px_rgba(180,255,0,0.3)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleSwitchMode('register')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'register'
                    ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_10px_rgba(180,255,0,0.3)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Register
              </button>
              <button
                onClick={() => handleSwitchMode('forgot')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'forgot'
                    ? 'bg-[#B4FF00] text-[#0B1A12] shadow-[0_0_10px_rgba(180,255,0,0.3)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Forgot?
              </button>
            </div>

            {/* Notifications & Error Banners */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2 animate-fadeIn font-sans">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn font-sans">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {emailConfirmedNotice && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#B4FF00]/15 border border-[#B4FF00]/40 text-[#B4FF00] text-xs flex items-start gap-2.5 animate-fadeIn font-sans">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#B4FF00]" />
                <span className="leading-relaxed">{emailConfirmedNotice}</span>
              </div>
            )}

            {/* MODE 1: LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs text-white/60 font-semibold mb-1 block">Registered Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                    <input
                      type="email"
                      required
                      placeholder="developer@nexora.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-white/60 font-semibold">Account Password</label>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-[11px] text-[#B4FF00] hover:underline font-semibold"
                    >
                      Forgotten password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full neo-button py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 mt-2 shadow-[0_0_15px_rgba(180,255,0,0.3)] disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  {loading ? 'Authenticating...' : 'Sign In To Account'}
                </button>
              </form>
            )}

            {/* MODE 2: REGISTER FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs text-white/60 font-semibold mb-1 block">Account Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/60 font-semibold mb-1 block">Display Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mohith Krishna R"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/60 font-semibold mb-1 block">Set Password (6+ characters)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/60 font-semibold mb-1 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 bg-[#0E2117] border rounded-xl text-xs text-white placeholder-white/30 focus:outline-none neo-inset font-mono ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-red-500'
                          : 'border-white/10 focus:border-[#B4FF00]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-white/40 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full neo-button py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 mt-2 shadow-[0_0_15px_rgba(180,255,0,0.3)] disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  {loading ? 'Creating Account...' : 'Register & Confirm Email'}
                </button>
              </form>
            )}

            {/* MODE 3: FORGOTTEN PASSWORD FORM */}
            {authMode === 'forgot' && (
              <div>
                {!isResetStep ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="text-xs text-white/60 font-semibold mb-1 block">Registered Account Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                        <input
                          type="email"
                          required
                          placeholder="your.email@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset"
                        />
                      </div>
                      <p className="text-[11px] text-white/40 mt-1.5">
                        We will send password change method details to your registered account email.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full neo-button py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(180,255,0,0.3)] disabled:opacity-50"
                    >
                      <KeyRound className="w-4 h-4" />
                      {loading ? 'Verifying Account...' : 'Send Password Change Method'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSwitchMode('login')}
                      className="w-full text-center text-xs text-white/60 hover:text-white flex items-center justify-center gap-1 font-semibold pt-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Sign In
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    <div>
                      <label className="text-xs text-white/60 font-semibold mb-1 block">New Password (6+ characters)</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-white/40 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/60 font-semibold mb-1 block">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-[#0E2117] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#B4FF00] neo-inset font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-white/40 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full neo-button py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(180,255,0,0.3)] disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

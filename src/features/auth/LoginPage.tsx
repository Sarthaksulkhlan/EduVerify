import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertCircle, ShieldCheck, GraduationCap, ArrowRight, Clock, ArrowLeft } from 'lucide-react';
import { WeaveLogo } from '../../components/ui/WeaveLogo';
import { HeroBackgroundCanvas } from '../landing/components/HeroBackgroundCanvas';
import { weaveApiClient, ApiClientError } from '../../lib/api-client';
import { useAuth } from '../../lib/auth';

const loginSchema = z.object({
  uniqueId: z
    .string()
    .trim()
    .min(3, 'Enter a valid Unique ID code.'),
  password: z
    .string()
    .min(4, 'Enter your password.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithAccount, sessionExpiredReason } = useAuth();
  const [loginType, setLoginType] = useState<'administration' | 'student'>('administration');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isIdleTimeoutRedirect =
    searchParams.get('reason') === 'idle_timeout' ||
    sessionExpiredReason === 'IDLE_TIMEOUT_15M';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      uniqueId: 'AICTE-ADMIN-01',
      password: 'synth-demo-session',
    },
  });

  const handleSwitchLoginType = (type: 'administration' | 'student') => {
    setLoginType(type);
    setAuthError(null);
    setValue('uniqueId', type === 'administration' ? 'AICTE-ADMIN-01' : 'STU-2026-101', {
      shouldValidate: true,
    });
    setValue('password', 'synth-demo-session', { shouldValidate: true });
  };

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    try {
      const response = await weaveApiClient.login(values.uniqueId, values.password, loginType);
      loginWithAccount(response.user, response.access_token);
      if (loginType === 'student' || response.user.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setAuthError(`${err.message} (${err.code})`);
      } else {
        setAuthError('Unable to reach authentication endpoint. Verify server status.');
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center text-[#23201B] px-6 py-12 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 15% 20%, rgba(21, 128, 61, 0.14) 0%, transparent 44%), radial-gradient(circle at 82% 24%, rgba(184, 137, 56, 0.18) 0%, transparent 46%), radial-gradient(circle at 52% 86%, rgba(153, 27, 27, 0.12) 0%, transparent 48%), linear-gradient(135deg, #FAF6EC 0%, #F4EDE0 52%, #EFE6D5 100%)',
      }}
    >
      {/* Continuous Live Emerald-Gold-Crimson Background Canvas */}
      <HeroBackgroundCanvas />

      <div className="relative z-10 w-full max-w-md space-y-3 animate-blur-in">
        {/* Universal Back Button Above Login Card */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            data-spotlight-accent="true"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#23201B] bg-[#FFFDF9]/95 hover:bg-[#EFE8D8] border border-[#D8CEB8] shadow-2xs transition-all cursor-pointer hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#8C6520]" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#6E675C]">
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
            <span>10m Session Security Active</span>
          </div>
        </div>

        <div className="w-full bg-[#FFFDF9]/95 backdrop-blur-xs border border-[#DFD2B8] rounded-xl p-7 sm:p-8 shadow-lg space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <Link to="/" data-spotlight-accent="true" className="inline-block transition-transform hover:scale-105">
              <WeaveLogo />
            </Link>
            <h1 className="font-display text-2xl font-bold text-[#23201B] pt-1">
              Sign in to EduVerify
            </h1>
            <p className="text-xs text-[#5C564C]">
              {loginType === 'administration'
                ? 'AICTE Administration Console · Centralised Institutional & Verification Oversight'
                : 'My EduVerify Student Portal · Personal APAAR & Academic Verification'}
            </p>
          </div>

          {/* Two Options: Administration Login & Student Login */}
          <div
            role="tablist"
            aria-label="Login Portal Type"
            className="grid grid-cols-2 gap-1.5 p-1 bg-[#F5EFE2] border border-[#DFD2B8] rounded-lg"
          >
            <button
              type="button"
              role="tab"
              data-spotlight-accent="true"
              aria-selected={loginType === 'administration'}
              onClick={() => handleSwitchLoginType('administration')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                loginType === 'administration'
                  ? 'bg-[#23201B] text-[#FFFDF9] shadow-xs'
                  : 'text-[#5C564C] hover:text-[#23201B] hover:bg-[#EFE7D5]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#D4AF37]" />
              <span>Administration Login</span>
            </button>

            <button
              type="button"
              role="tab"
              data-spotlight-accent="true"
              aria-selected={loginType === 'student'}
              onClick={() => handleSwitchLoginType('student')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                loginType === 'student'
                  ? 'bg-[#14532D] text-[#FFFDF9] shadow-xs'
                  : 'text-[#5C564C] hover:text-[#23201B] hover:bg-[#EFE7D5]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0 text-[#86EFAC]" />
              <span>Student Login</span>
            </button>
          </div>

          {/* Portal destination indicator & Live Compliance status */}
          <div
            className={`px-3.5 py-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
              loginType === 'administration'
                ? 'bg-[#FAF3E3] border-[#DFC99B] text-[#23201B]'
                : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#14532D]'
            }`}
          >
            <div>
              <span className="font-semibold">
                {loginType === 'administration' ? 'AICTE Admin Console' : 'My EduVerify Portal'}
              </span>
              <span className="text-[#5C564C] ml-1.5 font-mono text-[11px]">
                {loginType === 'administration' ? '→ /admin/dashboard' : '→ /student/dashboard'}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                loginType === 'administration'
                  ? 'bg-[#23201B] text-[#E8C87A]'
                  : 'bg-[#14532D] text-[#ECFDF5]'
              }`}
            >
              {loginType === 'administration' ? 'ADMIN ROLE' : 'STUDENT ROLE'}
            </span>
          </div>

          {/* 10-Minute Session Security Badge */}
          <div className="px-3 py-2 rounded-lg bg-[#FAF7F0] border border-[#E5DEC9] flex items-center justify-between text-[11px] font-mono text-[#5C564C]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#B88938]" />
              <span>10-Minute Session Policy:</span>
            </div>
            <span className="text-[#14532D] font-bold">10:00 Live Timeline Bar Active</span>
          </div>

          {/* 10-Minute Session Timeout Security Compliance Banner */}
          {isIdleTimeoutRedirect && !authError && (
            <div
              role="alert"
              className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2.5 text-xs text-amber-900"
            >
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <div className="space-y-0.5">
                <p className="font-semibold text-amber-950">
                  Session Timeout Reached (10-Minute Policy)
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Your 10-minute session countdown completed and automatically returned you to the
                  login page for security compliance. Please sign in again to start a fresh 10-minute
                  session.
                </p>
              </div>
            </div>
          )}

          {authError && (
            <div
              role="alert"
              className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg flex items-start gap-2 text-xs text-[#EF4444]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form: Only Unique ID Code and Password */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-unique-id"
                  className="block text-xs font-semibold text-[#1E293B]"
                >
                  Unique ID Code
                </label>
                <div className="flex items-center gap-1.5">
                  {loginType === 'student' ? (
                    <>
                      <button
                        type="button"
                        data-spotlight-accent="true"
                        onClick={() => setValue('uniqueId', 'STU-2026-101', { shouldValidate: true })}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-[#14532D] border border-emerald-200 transition-colors cursor-pointer"
                        title="Click to fill Rohan Sharma (BTECH-CSE)"
                      >
                        STU-2026-101
                      </button>
                      <button
                        type="button"
                        data-spotlight-accent="true"
                        onClick={() => setValue('uniqueId', 'STU-2026-103', { shouldValidate: true })}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-50 text-amber-800 border border-slate-200 transition-colors cursor-pointer"
                        title="Click to fill Priya Verma (BTECH-ECE)"
                      >
                        STU-2026-103
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        data-spotlight-accent="true"
                        onClick={() =>
                          setValue('uniqueId', 'AICTE-ADMIN-01', { shouldValidate: true })
                        }
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-[#7A5B20] border border-amber-200 transition-colors cursor-pointer"
                        title="Click to fill National Directorate Admin"
                      >
                        AICTE-ADMIN-01
                      </button>
                      <button
                        type="button"
                        data-spotlight-accent="true"
                        onClick={() =>
                          setValue('uniqueId', 'INST-KKR-101', { shouldValidate: true })
                        }
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                        title="Click to fill NIT Kurukshetra Operator"
                      >
                        INST-KKR-101
                      </button>
                    </>
                  )}
                </div>
              </div>
            <input
              id="login-unique-id"
              type="text"
              autoComplete="username"
              placeholder={
                loginType === 'administration' ? 'e.g. AICTE-ADMIN-01' : 'e.g. STU-2026-101'
              }
              {...register('uniqueId')}
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#F8FAFC] border border-slate-300 rounded-lg text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
            {errors.uniqueId && (
              <p role="alert" className="mt-1 text-xs text-[#EF4444]">
                {errors.uniqueId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-[#1E293B] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                {...register('password')}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm font-mono bg-[#F8FAFC] border border-slate-300 rounded-lg text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1E293B] p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p role="alert" className="mt-1 text-xs text-[#EF4444]">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 text-sm font-semibold text-[#FFFDF9] rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
              loginType === 'administration'
                ? 'bg-[#23201B] hover:bg-[#38332B] border border-[#B88938]/50'
                : 'bg-[#14532D] hover:bg-[#166534]'
            }`}
          >
            <span>
              {isSubmitting
                ? 'Signing in...'
                : loginType === 'administration'
                  ? 'Sign in to AICTE Admin Console'
                  : 'Sign in to My EduVerify Portal'}
            </span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

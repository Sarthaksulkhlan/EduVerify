import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertCircle, ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';
import { WeaveLogo } from '../../components/ui/WeaveLogo';
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
  const { loginWithAccount } = useAuth();
  const [loginType, setLoginType] = useState<'administration' | 'student'>('administration');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC] text-[#1E293B] px-6 py-12 relative overflow-hidden">
      {/* Subtle architectural background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(37, 99, 235, 0.08), transparent 45%), radial-gradient(circle at 80% 85%, rgba(34, 211, 238, 0.08), transparent 45%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md bg-[#FFFFFF] border border-slate-200 rounded-xl p-7 sm:p-8 shadow-lg shadow-slate-900/5 space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <Link to="/" className="inline-block">
            <WeaveLogo />
          </Link>
          <h1 className="font-display text-2xl font-bold text-[#102A43] pt-1">
            Sign in to EduVerify
          </h1>
          <p className="text-xs text-slate-500">
            {loginType === 'administration'
              ? 'AICTE Administration Console · Centralised Institutional & Verification Oversight'
              : 'My EduVerify Student Portal · Personal APAAR & Academic Verification'}
          </p>
        </div>

        {/* Two Options: Administration Login & Student Login */}
        <div
          role="tablist"
          aria-label="Login Portal Type"
          className="grid grid-cols-2 gap-1.5 p-1 bg-[#F8FAFC] border border-slate-200 rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={loginType === 'administration'}
            onClick={() => handleSwitchLoginType('administration')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all ${
              loginType === 'administration'
                ? 'bg-[#102A43] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#102A43]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#22D3EE]" />
            <span>Administration Login</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={loginType === 'student'}
            onClick={() => handleSwitchLoginType('student')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all ${
              loginType === 'student'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#102A43]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span>Student Login</span>
          </button>
        </div>

        {/* Portal destination indicator */}
        <div
          className={`px-3.5 py-2.5 rounded-lg border text-xs flex items-center justify-between ${
            loginType === 'administration'
              ? 'bg-[#102A43]/5 border-[#102A43]/15 text-[#102A43]'
              : 'bg-[#2563EB]/5 border-[#2563EB]/20 text-[#1E293B]'
          }`}
        >
          <div>
            <span className="font-semibold">
              {loginType === 'administration' ? 'AICTE Admin Console' : 'My EduVerify Portal'}
            </span>
            <span className="text-slate-500 ml-1.5 font-mono text-[11px]">
              {loginType === 'administration' ? '→ /admin/dashboard' : '→ /student/dashboard'}
            </span>
          </div>
          <span
            className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
              loginType === 'administration'
                ? 'bg-[#102A43] text-[#22D3EE]'
                : 'bg-[#2563EB] text-white'
            }`}
          >
            {loginType === 'administration' ? 'ADMIN ROLE' : 'STUDENT ROLE'}
          </span>
        </div>

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
                      onClick={() => setValue('uniqueId', 'STU-2026-101', { shouldValidate: true })}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-[#2563EB] border border-slate-200"
                    >
                      STU-2026-101
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('uniqueId', 'STU-2026-103', { shouldValidate: true })}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 hover:bg-amber-50 text-amber-700 border border-slate-200"
                    >
                      STU-2026-103
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setValue('uniqueId', 'AICTE-ADMIN-01', { shouldValidate: true })
                      }
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[#102A43] border border-slate-200"
                    >
                      AICTE-ADMIN-01
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setValue('uniqueId', 'INST-KKR-101', { shouldValidate: true })
                      }
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
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
            className={`w-full py-2.5 px-4 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
              loginType === 'administration'
                ? 'bg-[#102A43] hover:bg-[#1E3A5F]'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
            }`}
          >
            <span>
              {isSubmitting
                ? 'Signing in...'
                : loginType === 'administration'
                  ? 'Sign in to AICTE Admin Console'
                  : 'Sign in to My EduVerify Portal'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { weaveQueryClient } from './lib/query-client';
import { AuthProvider, useAuth } from './lib/auth';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { VerifyPage } from './features/verification/VerifyPage';
import { StudentLayout } from './components/layout/StudentLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import {
  StudentDashboardPage,
  StudentProfilePage,
  StudentAcademicRecordsPage,
  StudentApaarPage,
  StudentVerificationPage,
  StudentDiscrepanciesPage,
  StudentConsentPage,
  StudentHistoryPage,
  StudentHelpPage,
} from './features/student/StudentPortalPages';
import {
  AdminDashboardPage,
  AdminInstitutionsPage,
  AdminStudentsPage,
  AdminValidationAndUploadPage,
  AdminDuplicatesPage,
  AdminIntakeMonitoringPage,
  AdminVerificationPage,
  AdminReportsPage,
  AdminAuditLogsPage,
} from './features/admin/AdminPortalPages';
import {
  BatchValidationResultsPage,
} from './features/imports/ImportsPages';
import {
  AssistantPage,
  SettingsPage,
} from './features/audit/AuditAndAssistantPages';
import { GlobalCursorSpotlight } from './components/ui/PortalEnhancements';

const RoleBasedWorkspaceRedirect: React.FC = () => {
  const { isStudent } = useAuth();
  return <Navigate to={isStudent ? '/student/dashboard' : '/admin/dashboard'} replace />;
};

export function App() {
  return (
    <QueryClientProvider client={weaveQueryClient}>
      <AuthProvider>
        <BrowserRouter>
          {/* Subtle Champagne-Gold Mouse Cursor Spotlight Halo Follower */}
          <GlobalCursorSpotlight />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify/:token" element={<VerifyPage />} />

            {/* Student Portal Routes — My EduVerify (/student/*) */}
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboardPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="academic-records" element={<StudentAcademicRecordsPage />} />
              <Route path="apaar" element={<StudentApaarPage />} />
              <Route path="verification" element={<StudentVerificationPage />} />
              <Route path="discrepancies" element={<StudentDiscrepanciesPage />} />
              <Route path="consent" element={<StudentConsentPage />} />
              <Route path="history" element={<StudentHistoryPage />} />
              <Route path="help" element={<StudentHelpPage />} />
            </Route>

            {/* Administration Portal Routes — AICTE Admin Console (/admin/*) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="institutions" element={<AdminInstitutionsPage />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="bulk-upload" element={<AdminValidationAndUploadPage />} />
              <Route path="data-validation" element={<AdminValidationAndUploadPage />} />
              <Route path="duplicates" element={<AdminDuplicatesPage />} />
              <Route path="intake-monitoring" element={<AdminIntakeMonitoringPage />} />
              <Route path="verification" element={<AdminVerificationPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="assistant" element={<AssistantPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="imports/:id" element={<BatchValidationResultsPage />} />
            </Route>

            {/* Legacy /app/* Compatibility Redirects */}
            <Route path="/app" element={<RoleBasedWorkspaceRedirect />} />
            <Route path="/app/students" element={<Navigate to="/admin/students" replace />} />
            <Route path="/app/imports" element={<Navigate to="/admin/data-validation" replace />} />
            <Route path="/app/imports/new" element={<Navigate to="/admin/bulk-upload" replace />} />
            <Route path="/app/duplicates" element={<Navigate to="/admin/duplicates" replace />} />
            <Route path="/app/intake" element={<Navigate to="/admin/intake-monitoring" replace />} />
            <Route path="/app/institutions" element={<Navigate to="/admin/institutions" replace />} />
            <Route path="/app/programs" element={<Navigate to="/admin/intake-monitoring" replace />} />
            <Route path="/app/audit" element={<Navigate to="/admin/audit-logs" replace />} />
            <Route path="/app/assistant" element={<Navigate to="/admin/assistant" replace />} />
            <Route path="/app/settings" element={<Navigate to="/admin/settings" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

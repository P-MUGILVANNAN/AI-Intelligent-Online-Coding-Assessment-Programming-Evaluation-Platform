import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';

// Public & Auth Pages
import { LandingPage } from '../pages/public/LandingPage';
import { FeaturesPage } from '../pages/public/FeaturesPage';
import { AboutPage } from '../pages/public/AboutPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { AvailableAssessments } from '../pages/student/AvailableAssessments';
import { AssessmentInstructions } from '../pages/student/AssessmentInstructions';
import { CodingWorkspace } from '../pages/student/CodingWorkspace';
import { SubmissionHistory } from '../pages/student/SubmissionHistory';
import { SubmissionDetail } from '../pages/student/SubmissionDetail';
import { StudentAnalytics } from '../pages/student/StudentAnalytics';
import { ProfileSettings } from '../pages/student/ProfileSettings';

// Instructor Pages
import { InstructorDashboard } from '../pages/instructor/InstructorDashboard';
import { ManageAssessments } from '../pages/instructor/ManageAssessments';
import { CreateAssessment } from '../pages/instructor/CreateAssessment';
import { QuestionBank } from '../pages/instructor/QuestionBank';
import { QuestionBuilder } from '../pages/instructor/QuestionBuilder';
import { AssessmentMonitoring } from '../pages/instructor/AssessmentMonitoring';
import { PlagiarismAnalysis } from '../pages/instructor/PlagiarismAnalysis';
import { ReportGeneration } from '../pages/instructor/ReportGeneration';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { PlatformAnalytics } from '../pages/admin/PlatformAnalytics';
import { UserManagement } from '../pages/admin/UserManagement';
import { InstitutionManagement } from '../pages/admin/InstitutionManagement';
import { SystemSettings } from '../pages/admin/SystemSettings';

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0b24] text-[#a5a3ee] font-semibold text-sm">
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'Administrator') return <Navigate to="/admin" replace />;
    if (role === 'Instructor') return <Navigate to="/instructor" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Student Protected Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['Student', 'Instructor', 'Administrator']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="assessments" element={<AvailableAssessments />} />
        <Route path="assessments/:id/instructions" element={<AssessmentInstructions />} />
        <Route path="submissions" element={<SubmissionHistory />} />
        <Route path="submissions/:id" element={<SubmissionDetail />} />
        <Route path="analytics" element={<StudentAnalytics />} />
        <Route path="profile" element={<ProfileSettings />} />
      </Route>

      {/* Standalone Fullscreen Coding Workspace */}
      <Route
        path="/student/assessments/:id/workspace"
        element={
          <ProtectedRoute allowedRoles={['Student', 'Instructor', 'Administrator']}>
            <CodingWorkspace />
          </ProtectedRoute>
        }
      />

      {/* Instructor Protected Portal */}
      <Route
        path="/instructor"
        element={
          <ProtectedRoute allowedRoles={['Instructor', 'Administrator']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
        <Route path="assessments" element={<ManageAssessments />} />
        <Route path="assessments/create" element={<CreateAssessment />} />
        <Route path="questions" element={<QuestionBank />} />
        <Route path="questions/create" element={<QuestionBuilder />} />
        <Route path="monitoring" element={<AssessmentMonitoring />} />
        <Route path="plagiarism" element={<PlagiarismAnalysis />} />
        <Route path="reports" element={<ReportGeneration />} />
      </Route>

      {/* Administrator Protected Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Administrator']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="institutions" element={<InstitutionManagement />} />
        <Route path="assessments" element={<ManageAssessments />} />
        <Route path="questions" element={<QuestionBank />} />
        <Route path="submissions" element={<SubmissionHistory />} />
        <Route path="plagiarism" element={<PlagiarismAnalysis />} />
        <Route path="analytics" element={<PlatformAnalytics />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

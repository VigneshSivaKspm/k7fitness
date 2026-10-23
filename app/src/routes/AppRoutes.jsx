import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';
import { PageLoader } from '../components/ui/Feedback';
import Login from '../pages/Login';

// Admin / Staff Pages
const Dashboard = lazy(() => import('../pages/Dashboard'));
const TraineeList = lazy(() => import('../pages/trainees/TraineeList'));
const TraineeFormPage = lazy(() => import('../pages/trainees/TraineeFormPage'));
const TraineeProfile = lazy(() => import('../pages/trainees/TraineeProfile'));
const AssignmentEditor = lazy(() => import('../pages/trainees/AssignmentEditor'));
const Attendance = lazy(() => import('../pages/Attendance'));
const Memberships = lazy(() => import('../pages/Memberships'));
const FeesPage = lazy(() => import('../pages/fees/FeesPage'));
const ReceiptPage = lazy(() => import('../pages/fees/ReceiptPage'));
const WorkoutList = lazy(() => import('../pages/workouts/WorkoutList'));
const WorkoutEditorPage = lazy(() => import('../pages/workouts/WorkoutEditorPage'));
const DietList = lazy(() => import('../pages/diets/DietList'));
const DietEditorPage = lazy(() => import('../pages/diets/DietEditorPage'));
const Renewals = lazy(() => import('../pages/Renewals'));
const Enquiries = lazy(() => import('../pages/Enquiries'));
const Reports = lazy(() => import('../pages/Reports'));
const Settings = lazy(() => import('../pages/Settings'));
const WebsiteOverview = lazy(() => import('../pages/website/WebsiteOverview'));
const HeroPage = lazy(() => import('../pages/website/HeroPage'));
const AboutPage = lazy(() => import('../pages/website/AboutPage'));
const ContactPage = lazy(() => import('../pages/website/ContactPage'));
const CmsCollectionPage = lazy(() => import('../pages/website/CmsCollectionPage'));
const GalleryPage = lazy(() => import('../pages/website/GalleryPage'));
const PrintPlanPage = lazy(() => import('../pages/PrintPlanPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Member Portal Pages
const MemberLayout = lazy(() => import('../pages/member/MemberLayout'));
const MemberDashboard = lazy(() => import('../pages/member/MemberDashboard'));
const MemberWorkout = lazy(() => import('../pages/member/MemberWorkout'));
const MemberDiet = lazy(() => import('../pages/member/MemberDiet'));
const MemberAttendance = lazy(() => import('../pages/member/MemberAttendance'));
const MemberFees = lazy(() => import('../pages/member/MemberFees'));
const MemberProfile = lazy(() => import('../pages/member/MemberProfile'));
const MemberEquipmentDemos = lazy(() => import('../pages/member/MemberEquipmentDemos'));
const MemberInstructions = lazy(() => import('../pages/member/MemberInstructions'));

// Equipment & Instructions Pages (Admin)
const EquipmentPage = lazy(() => import('../pages/equipment/EquipmentPage'));
const ExercisesPage = lazy(() => import('../pages/exercises/ExercisesPage'));
const InstructionsEditorPage = lazy(() => import('../pages/instructions/InstructionsEditorPage'));

// Personal Trainer Portal
const TrainerDashboard = lazy(() => import('../pages/trainer/TrainerDashboard'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          {/* Member Portal Routes */}
          <Route path="/member" element={<MemberLayout />}>
            <Route index element={<MemberDashboard />} />
            <Route path="workout" element={<MemberWorkout />} />
            <Route path="diet" element={<MemberDiet />} />
            <Route path="attendance" element={<MemberAttendance />} />
            <Route path="fees" element={<MemberFees />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="equipment" element={<MemberEquipmentDemos />} />
            <Route path="instructions" element={<MemberInstructions />} />
          </Route>

          {/* Personal Trainer Portal */}
          <Route path="/trainer" element={<TrainerDashboard />} />

          {/* Standalone staff views */}
          <Route path="/fees/receipts/:paymentId" element={<ReceiptPage />} />
          <Route path="/print/:kind/:source/:id" element={<PrintPlanPage />} />

          {/* Admin CRM Layout */}
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<TraineeList />} />
            <Route path="/members/new" element={<TraineeFormPage />} />
            <Route path="/members/:id" element={<TraineeProfile />} />
            <Route path="/members/:id/edit" element={<TraineeFormPage />} />
            <Route path="/members/:id/:kind/:assignmentId" element={<AssignmentEditor />} />

            {/* Backwards compatibility aliases for /trainees */}
            <Route path="/trainees" element={<Navigate to="/members" replace />} />
            <Route path="/trainees/new" element={<Navigate to="/members/new" replace />} />
            <Route path="/trainees/:id" element={<TraineeProfile />} />
            <Route path="/trainees/:id/edit" element={<TraineeFormPage />} />
            <Route path="/trainees/:id/:kind/:assignmentId" element={<AssignmentEditor />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/memberships" element={<Memberships />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/workouts" element={<WorkoutList />} />
            <Route path="/workouts/new" element={<WorkoutEditorPage />} />
            <Route path="/workouts/:id" element={<WorkoutEditorPage />} />
            <Route path="/diets" element={<DietList />} />
            <Route path="/diets/new" element={<DietEditorPage />} />
            <Route path="/diets/:id" element={<DietEditorPage />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route path="/instructions" element={<InstructionsEditorPage />} />
            <Route path="/renewals" element={<Renewals />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/website" element={<WebsiteOverview />} />
            <Route path="/website/hero" element={<HeroPage />} />
            <Route path="/website/about" element={<AboutPage />} />
            <Route path="/website/contact" element={<ContactPage />} />
            <Route path="/website/memberships" element={<Memberships website />} />
            <Route path="/website/gallery" element={<GalleryPage />} />
            <Route path="/website/:collection" element={<CmsCollectionPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

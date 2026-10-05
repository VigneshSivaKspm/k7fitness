import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';
import { PageLoader } from '../components/ui/Feedback';
import Login from '../pages/Login';

// Route-level code splitting keeps the first load small on mobile.
const Dashboard = lazy(() => import('../pages/Dashboard'));
const TraineeList = lazy(() => import('../pages/trainees/TraineeList'));
const TraineeFormPage = lazy(() => import('../pages/trainees/TraineeFormPage'));
const TraineeProfile = lazy(() => import('../pages/trainees/TraineeProfile'));
const AssignmentEditor = lazy(() => import('../pages/trainees/AssignmentEditor'));
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

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/fees/receipts/:paymentId" element={<ReceiptPage />} />
          <Route path="/print/:kind/:source/:id" element={<PrintPlanPage />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trainees" element={<TraineeList />} />
            <Route path="/trainees/new" element={<TraineeFormPage />} />
            <Route path="/trainees/:id" element={<TraineeProfile />} />
            <Route path="/trainees/:id/edit" element={<TraineeFormPage />} />
            <Route path="/trainees/:id/:kind/:assignmentId" element={<AssignmentEditor />} />
            <Route path="/memberships" element={<Memberships />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/workouts" element={<WorkoutList />} />
            <Route path="/workouts/new" element={<WorkoutEditorPage />} />
            <Route path="/workouts/:id" element={<WorkoutEditorPage />} />
            <Route path="/diets" element={<DietList />} />
            <Route path="/diets/new" element={<DietEditorPage />} />
            <Route path="/diets/:id" element={<DietEditorPage />} />
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

import { assetUrl } from '../utils/format';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import { PageLoader } from '../components/ui/Feedback';

/** Protects authenticated routes and enforces staff vs member role boundaries. */
export default function ProtectedRoute() {
  const { status, role } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink">
        <div className="flex flex-col items-center gap-5">
          <img src={assetUrl('icons/logo.png')} alt="K7 Fitness" className="h-14 w-auto object-contain animate-pulse" />
          <PageLoader label="" />
        </div>
      </div>
    );
  }

  if (status !== 'signedIn') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  const isMemberPath = location.pathname.startsWith('/member');
  const isTrainerPath = location.pathname.startsWith('/trainer');

  // Members can only access /member routes
  if (role === 'member' && !isMemberPath) {
    return <Navigate to="/member" replace />;
  }

  // Trainers can only access /trainer routes
  if (role === 'trainer' && !isTrainerPath) {
    return <Navigate to="/trainer" replace />;
  }

  return (
    <SettingsProvider>
      <Outlet />
    </SettingsProvider>
  );
}

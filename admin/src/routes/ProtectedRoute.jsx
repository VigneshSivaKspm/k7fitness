import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import { PageLoader } from '../components/ui/Feedback';

/** Only verified, active admins get past this point. */
export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink">
        <div className="flex flex-col items-center gap-5">
          <img src="/brand/k7-mark.svg" alt="K7 Fitness" className="h-14 w-auto animate-pulse" />
          <PageLoader label="" />
        </div>
      </div>
    );
  }
  if (status !== 'signedIn') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return (
    <SettingsProvider>
      <Outlet />
    </SettingsProvider>
  );
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { DEV_AUTH_BYPASS, devBypassSignIn, fetchAdminProfile, sendPasswordReset, signIn, signOutUser } from '../services/authService';
import { friendlyError } from '../utils/errors';

const AuthContext = createContext(null);

let devBypassAttempted = false;

const NO_ACCESS = 'This account does not have access to the K7 admin panel. Contact the gym owner.';

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: auth ? 'loading' : 'signedOut', user: null, admin: null, error: '' });

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Dev-only: sign in automatically once per page load (logout still works).
        if (DEV_AUTH_BYPASS && !devBypassAttempted) {
          devBypassAttempted = true;
          devBypassSignIn().catch((err) => setState({ status: 'signedOut', user: null, admin: null, error: friendlyError(err) }));
          return;
        }
        setState((s) => ({ status: 'signedOut', user: null, admin: null, error: s.error }));
        return;
      }
      try {
        const admin = await fetchAdminProfile(user.uid);
        if (!admin || admin.active !== true) {
          if (DEV_AUTH_BYPASS) console.warn('[dev bypass] Signed in as', user.email, 'but admins/' + user.uid + ' is missing. Run scripts/create-admin.mjs for this email.');
          await signOutUser();
          setState({ status: 'signedOut', user: null, admin: null, error: NO_ACCESS });
          return;
        }
        setState({ status: 'signedIn', user, admin: { ...admin, email: admin.email || user.email }, error: '' });
      } catch (err) {
        await signOutUser();
        setState({ status: 'signedOut', user: null, admin: null, error: friendlyError(err) });
      }
    });
  }, []);

  const login = useCallback(async (email, password) => {
    setState((s) => ({ ...s, error: '' }));
    await signIn(email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      resetPassword: sendPasswordReset,
      devBypass: DEV_AUTH_BYPASS ? devBypassSignIn : null,
      clearError: () => setState((s) => ({ ...s, error: '' })),
      isOwner: state.admin?.role === 'owner',
    }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

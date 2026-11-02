import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  DEV_AUTH_BYPASS,
  devBypassSignIn,
  fetchAdminProfile,
  sendPasswordReset,
  signIn,
  signOutUser,
} from '../services/authService';
import {
  clearMemberSession,
  getStoredMemberSession,
  loginMember,
  setupFirstTimePassword,
  updateStoredMemberSession,
} from '../services/memberAuthService';
import {
  clearTrainerSession,
  getStoredTrainerSession,
  trainerLogin,
  trainerSetupPassword,
} from '../services/trainerAuthService';
import { friendlyError } from '../utils/errors';

const AuthContext = createContext(null);

let devBypassAttempted = false;

const NO_ACCESS = 'This account does not have access to the K7 admin panel. Contact the gym owner.';

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    const savedMember = getStoredMemberSession();
    if (savedMember) {
      return {
        status: 'signedIn',
        role: 'member',
        user: null,
        admin: null,
        member: savedMember,
        trainer: null,
        error: '',
      };
    }
    const savedTrainer = getStoredTrainerSession();
    if (savedTrainer) {
      return {
        status: 'signedIn',
        role: 'trainer',
        user: null,
        admin: null,
        member: null,
        trainer: savedTrainer,
        error: '',
      };
    }
    return {
      status: auth ? 'loading' : 'signedOut',
      role: null,
      user: null,
      admin: null,
      member: null,
      trainer: null,
      error: '',
    };
  });

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // If a member session is already active in localStorage, keep it
        const savedMember = getStoredMemberSession();
        if (savedMember) {
          setState({
            status: 'signedIn',
            role: 'member',
            user: null,
            admin: null,
            member: savedMember,
            trainer: null,
            error: '',
          });
          return;
        }

        // If a trainer session is already active in localStorage, keep it
        const savedTrainer = getStoredTrainerSession();
        if (savedTrainer) {
          setState({
            status: 'signedIn',
            role: 'trainer',
            user: null,
            admin: null,
            member: null,
            trainer: savedTrainer,
            error: '',
          });
          return;
        }

        // Dev-only: sign in automatically once per page load (logout still works).
        if (DEV_AUTH_BYPASS && !devBypassAttempted) {
          devBypassAttempted = true;
          devBypassSignIn().catch((err) =>
            setState({ status: 'signedOut', role: null, user: null, admin: null, member: null, trainer: null, error: friendlyError(err) })
          );
          return;
        }
        setState((s) => ({
          status: s.member || s.trainer ? 'signedIn' : 'signedOut',
          role: s.member ? 'member' : s.trainer ? 'trainer' : null,
          user: null,
          admin: null,
          member: s.member,
          trainer: s.trainer,
          error: s.error,
        }));
        return;
      }

      try {
        const admin = await fetchAdminProfile(user.uid);
        if (!admin || admin.active !== true) {
          if (DEV_AUTH_BYPASS) {
            console.warn(
              '[dev bypass] Signed in as',
              user.email,
              'but admins/' + user.uid + ' is missing. Run scripts/create-admin.mjs for this email.'
            );
          }
          await signOutUser();
          setState({ status: 'signedOut', role: null, user: null, admin: null, member: null, trainer: null, error: NO_ACCESS });
          return;
        }
        clearMemberSession();
        clearTrainerSession();
        setState({
          status: 'signedIn',
          role: 'staff',
          user,
          admin: { ...admin, email: admin.email || user.email },
          member: null,
          trainer: null,
          error: '',
        });
      } catch (err) {
        await signOutUser();
        setState({ status: 'signedOut', role: null, user: null, admin: null, member: null, trainer: null, error: friendlyError(err) });
      }
    });
  }, []);

  const login = useCallback(async (email, password) => {
    setState((s) => ({ ...s, error: '' }));
    clearMemberSession();
    clearTrainerSession();
    await signIn(email, password);
  }, []);

  const logout = useCallback(async () => {
    clearMemberSession();
    clearTrainerSession();
    setState({ status: 'signedOut', role: null, user: null, admin: null, member: null, trainer: null, error: '' });
    await signOutUser();
  }, []);

  const memberLoginAction = useCallback(async (memberId, password) => {
    setState((s) => ({ ...s, error: '' }));
    clearTrainerSession();
    const result = await loginMember(memberId, password);
    if (!result.firstTime && result.member) {
      setState({
        status: 'signedIn',
        role: 'member',
        user: null,
        admin: null,
        member: result.member,
        trainer: null,
        error: '',
      });
    }
    return result;
  }, []);

  const memberSetupPasswordAction = useCallback(async (traineeId, newPassword, extraData = {}) => {
    setState((s) => ({ ...s, error: '' }));
    clearTrainerSession();
    const member = await setupFirstTimePassword(traineeId, newPassword, extraData);
    setState({
      status: 'signedIn',
      role: 'member',
      user: null,
      admin: null,
      member,
      trainer: null,
      error: '',
    });
    return member;
  }, []);

  const trainerLoginAction = useCallback(async (trainerId, password) => {
    setState((s) => ({ ...s, error: '' }));
    clearMemberSession();
    const trainerSession = await trainerLogin(trainerId, password);
    setState({
      status: 'signedIn',
      role: 'trainer',
      user: null,
      admin: null,
      member: null,
      trainer: trainerSession,
      error: '',
    });
    return trainerSession;
  }, []);

  const trainerSetupPasswordAction = useCallback(async (trainerId, newPassword) => {
    setState((s) => ({ ...s, error: '' }));
    clearMemberSession();
    const trainerSession = await trainerSetupPassword(trainerId, newPassword);
    setState({
      status: 'signedIn',
      role: 'trainer',
      user: null,
      admin: null,
      member: null,
      trainer: trainerSession,
      error: '',
    });
    return trainerSession;
  }, []);

  const updateMemberSession = useCallback((fields) => {
    const updated = updateStoredMemberSession(fields);
    if (updated) {
      setState((s) => ({ ...s, member: updated }));
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isStaff: state.role === 'staff' || Boolean(state.admin),
      isMember: state.role === 'member' || Boolean(state.member),
      isTrainer: state.role === 'trainer' || Boolean(state.trainer),
      login,
      logout,
      memberLogin: memberLoginAction,
      memberSetupPassword: memberSetupPasswordAction,
      trainerLogin: trainerLoginAction,
      trainerSetupPassword: trainerSetupPasswordAction,
      updateMemberSession,
      resetPassword: sendPasswordReset,
      devBypass: DEV_AUTH_BYPASS ? devBypassSignIn : null,
      clearError: () => setState((s) => ({ ...s, error: '' })),
      isOwner: state.admin?.role === 'owner',
    }),
    [state, login, logout, memberLoginAction, memberSetupPasswordAction, trainerLoginAction, trainerSetupPasswordAction, updateMemberSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

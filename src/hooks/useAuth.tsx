import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  getMultiFactorResolver,
  RecaptchaVerifier,
  User,
  MultiFactorResolver,
  AuthError,
  MultiFactorError
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/firebase';

// Import des types depuis le fichier séparé
import type { UserData, AuthResult, SetupTwoFactorResult } from './auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  mfaResolver: MultiFactorResolver | null;
  signup: (email: string, password: string, userData?: UserData) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<{ success: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean }>;
  resendVerificationEmail: () => Promise<{ success: boolean }>;
  setupTwoFactor: (phoneNumber: string) => Promise<SetupTwoFactorResult>;
  completeTwoFactorSetup: (verificationCode: string) => Promise<{ success: boolean }>;
  verifyTwoFactor: (verificationCode: string, resolver?: MultiFactorResolver) => Promise<AuthResult>;
  disableTwoFactor: () => Promise<{ success: boolean }>;
  getUserData: () => Promise<DocumentData | null>;
  updateUserData: (data: Partial<UserData>) => Promise<{ success: boolean }>;
  setError: (error: string | null) => void;
}

// Context pour l'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Provider pour l'authentification
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour la 2FA
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Inscription avec email et mot de passe
  async function signup(email: string, password: string, userData: UserData = {}): Promise<AuthResult> {
    try {
      setError(null);
      setLoading(true);

      // Créer l'utilisateur
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Mettre à jour le profil avec le nom
      if (userData.firstName || userData.lastName) {
        await updateProfile(user, {
          displayName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
        });
      }

      // Envoyer l'email de vérification
      await sendEmailVerification(user);

      // Sauvegarder les données utilisateur dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        createdAt: new Date().toISOString(),
        emailVerified: false,
        twoFactorEnabled: false,
        ...userData
      });

      return { user, success: true };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Connexion avec email et mot de passe
  async function login(email: string, password: string): Promise<AuthResult> {
    try {
      setError(null);
      setLoading(true);

      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, success: true };
    } catch (error) {
      const authError = error as AuthError;
      // Gestion de la 2FA
      if (authError.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, error as MultiFactorError);
        setMfaResolver(resolver);
        return { 
          requiresMFA: true, 
          resolver,
          success: false 
        };
      }
      
      setError(authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Connexion avec Google
  async function signInWithGoogle(): Promise<AuthResult> {
    try {
      setError(null);
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      
      // Vérifier si l'utilisateur existe dans Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Créer le profil utilisateur s'il n'existe pas
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          phone: result.user.phoneNumber || '',
          createdAt: new Date().toISOString(),
          emailVerified: result.user.emailVerified,
          twoFactorEnabled: false,
          provider: 'google'
        });
      }

      return { user: result.user, success: true };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Déconnexion
  async function logout(): Promise<{ success: boolean }> {
    try {
      setError(null);
      await signOut(auth);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  }

  // Réinitialisation du mot de passe
  async function resetPassword(email: string): Promise<{ success: boolean }> {
    try {
      setError(null);
      setLoading(true);

      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      });

      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Renvoyer l'email de vérification
  async function resendVerificationEmail(): Promise<{ success: boolean }> {
    try {
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        return { success: true };
      }
      throw new Error('Aucun utilisateur connecté ou email déjà vérifié');
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  }

  // Configuration de la 2FA - Étape 1: Enrôler un numéro de téléphone
  async function setupTwoFactor(phoneNumber: string): Promise<SetupTwoFactorResult> {
    try {
      setError(null);
      setLoading(true);

      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      // Créer le RecaptchaVerifier
      const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA résolu
        }
      });
      setRecaptchaVerifier(recaptcha);

      // Créer le provider de téléphone et envoyer le code de vérification
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneNumber,
        recaptcha
      );

      setVerificationId(verificationId);
      return { success: true, verificationId };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Configuration de la 2FA - Étape 2: Vérifier le code et finaliser l'enrôlement
  async function completeTwoFactorSetup(verificationCode: string): Promise<{ success: boolean }> {
    try {
      setError(null);
      setLoading(true);

      if (!currentUser || !verificationId) {
        throw new Error('Configuration 2FA non initialisée');
      }

      // Créer les credentials avec le code de vérification
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      // Enrôler le facteur
      await multiFactor(currentUser).enroll(multiFactorAssertion, 'Téléphone principal');

      // Mettre à jour le statut 2FA dans Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        twoFactorEnabled: true,
        updatedAt: new Date().toISOString()
      });

      // Nettoyer les états temporaires
      setVerificationId(null);
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }

      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Vérification 2FA lors de la connexion
  async function verifyTwoFactor(verificationCode: string, resolver: MultiFactorResolver | null = null): Promise<AuthResult> {
    try {
      setError(null);
      setLoading(true);

      const currentResolver = resolver || mfaResolver;
      if (!currentResolver) {
        throw new Error('Aucune résolution MFA en cours');
      }

      // Obtenir l'indice du premier facteur (téléphone)
      const phoneAuthCredential = PhoneAuthProvider.credential(
        currentResolver.hints[0].uid,
        verificationCode
      );
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);

      // Résoudre la connexion avec le second facteur
      const result = await currentResolver.resolveSignIn(multiFactorAssertion);
      
      // Nettoyer l'état MFA
      setMfaResolver(null);

      return { user: result.user, success: true };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Désactiver la 2FA
  async function disableTwoFactor(): Promise<{ success: boolean }> {
    try {
      setError(null);
      setLoading(true);

      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      const multiFactorUser = multiFactor(currentUser);
      const enrolledFactors = multiFactorUser.enrolledFactors;

      // Désenrôler tous les facteurs
      for (const factor of enrolledFactors) {
        await multiFactorUser.unenroll(factor);
      }

      // Mettre à jour le statut dans Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        twoFactorEnabled: false,
        updatedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Obtenir les données utilisateur depuis Firestore
  async function getUserData(): Promise<DocumentData | null> {
    try {
      if (!currentUser) return null;
      
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  // Mettre à jour les données utilisateur
  async function updateUserData(data: Partial<UserData>): Promise<{ success: boolean }> {
    try {
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...data,
        updatedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  }

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    mfaResolver,
    signup,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    resendVerificationEmail,
    setupTwoFactor,
    completeTwoFactorSetup,
    verifyTwoFactor,
    disableTwoFactor,
    getUserData,
    updateUserData,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

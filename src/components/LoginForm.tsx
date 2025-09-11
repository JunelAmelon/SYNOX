import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const navigate = useNavigate();
  const { login, signInWithGoogle, resetPassword, verifyTwoFactor, loading, error, setError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.requiresMFA) {
        setShowMfaInput(true);
        return;
      }
      
      if (result.success) {
        onLogin();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const result = await signInWithGoogle();
      
      if (result.success) {
        onLogin();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erreur de connexion Google:', error);
    }
  };

  const handleMfaVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await verifyTwoFactor(mfaCode);
      
      if (result.success) {
        setShowMfaInput(false);
        onLogin();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erreur de vérification 2FA:', error);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setShowResetPassword(false);
        setResetSuccess(false);
        setResetEmail('');
      }, 3000);
    } catch (error) {
      console.error('Erreur de réinitialisation:', error);
    } finally {
      setResetLoading(false);
    }
  };

  // Modal de réinitialisation de mot de passe
  if (showResetPassword) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <div className="text-center mb-6">
          <h3 className="text-lg font-poly font-bold text-gray-900 dark:text-white mb-2">
            Réinitialiser le mot de passe
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Entrez votre adresse e-mail pour recevoir un lien de réinitialisation
          </p>
        </div>

        {resetSuccess ? (
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-green-600 dark:text-green-400 font-medium">
              Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-poly font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Adresse e-mail
              </label>
              <input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-white"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowResetPassword(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="flex-1 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium text-black bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-200 disabled:opacity-50"
              >
                {resetLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Envoyer'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Interface de vérification 2FA
  if (showMfaInput) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <div className="text-center mb-6">
          <h3 className="text-lg font-poly font-bold text-gray-900 dark:text-white mb-2">
            Vérification en deux étapes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Entrez le code de vérification envoyé sur votre téléphone
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleMfaVerification} className="space-y-4">
          <div>
            <label htmlFor="mfaCode" className="block text-sm font-poly font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Code de vérification
            </label>
            <input
              id="mfaCode"
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-white text-center text-lg tracking-widest"
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-black bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Vérifier
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-poly font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-white"
            placeholder="votre@email.com"
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-poly font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-200 dark:border-gray-600 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-white"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              className="h-4 w-4 text-amber-400 focus:ring-amber-400 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
              Se souvenir de moi
            </label>
          </div>
          <button
            type="button"
            onClick={() => setShowResetPassword(true)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-black bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Se connecter
        </button>

        {/* Divider */}
        <div className="relative my-4 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-stone-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Ou continuer avec</span>
          </div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center py-3 sm:py-4 px-4 border border-gray-200 dark:border-gray-600 rounded-xl text-base font-poly font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-200 disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-2 sm:mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>
      </form>

      {/* Conteneur pour reCAPTCHA (invisible) */}
      <div id="recaptcha-container"></div>

      {/* Sign Up Link */}
      <p className="text-center text-base text-gray-600 dark:text-gray-400 mt-4 sm:mt-6">
        Pas encore de compte ?{' '}
        <Link 
          to="/signup"
          className="font-poly font-bold text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
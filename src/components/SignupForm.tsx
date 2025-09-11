import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SignupFormProps {
  onLogin: () => void;
}

export default function SignupForm({ onLogin }: SignupFormProps) {
  const navigate = useNavigate();
  const { signup, signInWithGoogle, loading, error, setError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Validation du prénom
    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    }
    
    // Validation du nom
    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Adresse e-mail invalide';
    }
    
    // Validation du téléphone
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Numéro de téléphone invalide';
    }
    
    // Validation du mot de passe
    if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    // Validation de la confirmation du mot de passe
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    // Validation des conditions d'utilisation
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await signup(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      
      if (result.success) {
        setSignupSuccess(true);
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
    }
  };

  const handleGoogleSignUp = async () => {
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

  // Affichage du succès de l'inscription
  if (signupSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h3 className="text-xl font-poly font-bold text-gray-900 dark:text-white">
          Compte créé avec succès !
        </h3>
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            Un email de vérification a été envoyé à <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Vérifiez votre boîte de réception et cliquez sur le lien pour activer votre compte.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirection vers la page de connexion dans quelques secondes...
          </p>
        </div>
        <Link 
          to="/login"
          className="inline-block px-6 py-2 bg-amber-400 text-black font-medium rounded-xl hover:bg-amber-500 transition-colors"
        >
          Aller à la connexion
        </Link>
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
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prénom
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-white"
              placeholder="Prénom"
              required
            />
            {validationErrors.firstName && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validationErrors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-white"
              placeholder="Nom"
              required
            />
            {validationErrors.lastName && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validationErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          {validationErrors.email && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validationErrors.email}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Numéro de téléphone
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-white"
            placeholder="+229 XX XX XX XX"
            required
          />
          {validationErrors.phone && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validationErrors.phone}</p>
          )}
        </div>

        {/* Password Fields */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            {validationErrors.password && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-200 dark:border-gray-600 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-white"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="flex items-start">
          <input
            id="acceptTerms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            className="h-4 w-4 text-amber-400 focus:ring-amber-400 border-gray-300 rounded mt-1"
            required
          />
          <label htmlFor="acceptTerms" className="ml-3 block text-sm text-gray-600 dark:text-gray-400">
            J'accepte les{' '}
            <a href="#" className="text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 font-poly font-semibold transition-colors">
              Conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a href="#" className="text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 font-poly font-semibold transition-colors">
              Politique de confidentialité
            </a>
          </label>
          {validationErrors.acceptTerms && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validationErrors.acceptTerms}</p>
          )}
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
          Créer mon compte
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

        {/* Google Signup */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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

      {/* Sign In Link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 sm:mt-6">
        Déjà un compte ?{' '}
        <Link 
          to="/login"
          className="font-medium text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
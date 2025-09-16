import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  User, 
  Mail, 
  Key,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { useInvitation } from '../hooks/useInvitation';

interface AcceptInvitationProps {}

export default function AcceptInvitation({}: AcceptInvitationProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [trustedPartyName, setTrustedPartyName] = useState('');
  const [darkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const token = searchParams.get('token');
  const { acceptInvitation, loading } = useInvitation();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token d\'invitation manquant');
    }
  }, [token]);

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trustedPartyName.trim()) {
      setMessage('Veuillez entrer votre nom');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Token d\'invitation manquant');
      return;
    }

    setStatus('processing');

    try {
      const result = await acceptInvitation(token, trustedPartyName.trim());

      if (result.success) {
        setStatus('success');
        setAccessCode(result.accessCode || '');
        setMessage('Invitation acceptée avec succès ! Votre code d\'accès a été envoyé par email.');
      } else {
        setStatus('error');
        setMessage(result.error || 'Erreur lors de l\'acceptation de l\'invitation');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erreur de connexion. Veuillez réessayer plus tard.');
      console.error('Erreur:', error);
    }
  };

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700 text-white' 
    : 'bg-white border-gray-200 text-gray-900';

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Shield className="w-16 h-16 text-amber-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={darkMode ? "/logo-blanc.png" : "/logo-noir.png"} 
              alt="SYNOX Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-poly font-bold mb-2">
            Invitation Tiers de Confiance
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Acceptez votre invitation pour devenir un tiers de confiance SYNOX
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-md mx-auto">
          <div className={`rounded-2xl border-2 p-8 shadow-xl transition-all duration-300 ${cardClasses} ${getStatusColor()}`}>
            
            {/* Status Icon */}
            <div className="text-center mb-6">
              {getStatusIcon()}
            </div>

            {status === 'idle' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-poly font-bold mb-2">
                    Confirmer votre identité
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Entrez votre nom pour accepter cette invitation
                  </p>
                </div>

                <form onSubmit={handleAcceptInvitation} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-poly font-semibold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <User className="w-4 h-4 inline mr-2" />
                      Votre nom complet
                    </label>
                    <input
                      type="text"
                      value={trustedPartyName}
                      onChange={(e) => setTrustedPartyName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Ex: Marie Dubois"
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !trustedPartyName.trim()}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Traitement en cours...
                      </span>
                    ) : (
                      'Accepter l\'invitation'
                    )}
                  </button>
                </form>
              </>
            )}

            {status === 'processing' && (
              <div className="text-center">
                <h2 className="text-xl font-poly font-bold mb-4 text-blue-600 dark:text-blue-400">
                  Traitement en cours...
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Nous validons votre invitation et générons votre code d'accès
                </p>
              </div>
            )}

            {status === 'success' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-poly font-bold mb-2 text-green-600 dark:text-green-400">
                    Invitation acceptée !
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Félicitations ! Vous êtes maintenant un tiers de confiance.
                  </p>
                </div>

                {accessCode && (
                  <div className={`rounded-xl p-4 mb-4 border-2 border-dashed ${
                    darkMode ? 'bg-green-900/20 border-green-600' : 'bg-green-50 border-green-400'
                  }`}>
                    <div className="text-center">
                      <Key className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <p className="text-xs font-semibold mb-2 text-green-700 dark:text-green-300">
                        Votre code d'accès
                      </p>
                      <div className="text-2xl font-mono font-bold text-green-800 dark:text-green-200 tracking-widest">
                        {accessCode}
                      </div>
                      <p className="text-xs mt-2 text-green-600 dark:text-green-400">
                        Conservez précieusement ce code
                      </p>
                    </div>
                  </div>
                )}

                <div className={`rounded-xl p-4 mb-4 ${
                  darkMode ? 'bg-blue-900/20 border border-blue-600' : 'bg-blue-50 border border-blue-300'
                }`}>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Email envoyé
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Votre code d'accès a également été envoyé par email avec toutes les informations nécessaires.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-poly font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  Se connecter à SYNOX
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-poly font-bold mb-2 text-red-600 dark:text-red-400">
                    Erreur
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {message}
                  </p>
                </div>

                <div className={`rounded-xl p-4 mb-4 ${
                  darkMode ? 'bg-red-900/20 border border-red-600' : 'bg-red-50 border border-red-300'
                }`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                        Que faire ?
                      </p>
                      <ul className="text-xs text-red-600 dark:text-red-400 mt-1 space-y-1">
                        <li>• Vérifiez que le lien n'a pas expiré</li>
                        <li>• Contactez la personne qui vous a invité</li>
                        <li>• Réessayez plus tard</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStatus('idle');
                    setMessage('');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-poly font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                >
                  Réessayer
                </button>
              </>
            )}

            {message && status !== 'error' && (
              <div className="mt-4 text-center">
                <p className={`text-sm ${
                  status === 'success' 
                    ? 'text-green-600 dark:text-green-400' 
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            © 2025 SYNOX. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}

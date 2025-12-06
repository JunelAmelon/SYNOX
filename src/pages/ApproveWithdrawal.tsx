import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Shield, 
  Key,
  AlertTriangle,
  Loader,
  DollarSign,
  FileText,
  Clock
} from 'lucide-react';
import { useWithdrawalApproval } from '../hooks/useWithdrawalApproval';

export default function ApproveWithdrawal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [withdrawalRequest, setWithdrawalRequest] = useState<{
    vaultName: string;
    amount: number;
    reason?: string;
    createdAt: { toDate: () => Date };
  } | null>(null);
  const [darkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const requestId = searchParams.get('requestId');
  const partyId = searchParams.get('partyId');
  const { approveWithdrawal, getWithdrawalRequest, loading } = useWithdrawalApproval();

  useEffect(() => {
    if (!requestId || !partyId) {
      setStatus('error');
      setMessage('Paramètres de demande manquants');
      return;
    }

    // Charger les détails de la demande
    const loadRequest = async () => {
      const request = await getWithdrawalRequest(requestId);
      if (request) {
        setWithdrawalRequest(request);
      } else {
        setStatus('error');
        setMessage('Demande de retrait non trouvée');
      }
    };

    loadRequest();
  }, [requestId, partyId, getWithdrawalRequest]);

  const handleApproveWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      setMessage('Veuillez entrer votre code d\'accès');
      return;
    }

    if (!requestId || !partyId) {
      setStatus('error');
      setMessage('Paramètres manquants');
      return;
    }

    setStatus('processing');

    try {
      const result = await approveWithdrawal(requestId, partyId, accessCode.trim());

      if (result.success) {
        setStatus('success');
        if (result.allApproved) {
          setMessage('Retrait approuvé avec succès ! Tous les tiers de confiance ont donné leur accord. Le retrait va être traité.');
        } else {
          setMessage('Votre approbation a été enregistrée avec succès ! En attente de l\'approbation du second tiers de confiance.');
        }
      } else {
        setStatus('error');
        setMessage(result.error || 'Erreur lors de l\'approbation');
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
              alt="ARYWO Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-poly font-bold mb-2">
            Approbation de retrait
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Votre approbation est requise pour autoriser ce retrait
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-md mx-auto">
          <div className={`rounded-2xl border-2 p-8 shadow-xl transition-all duration-300 ${cardClasses} ${getStatusColor()}`}>
            
            {/* Status Icon */}
            <div className="text-center mb-6">
              {getStatusIcon()}
            </div>

            {/* Détails de la demande */}
            {withdrawalRequest && status === 'idle' && (
              <>
                <div className={`rounded-xl p-4 mb-6 ${
                  darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <h3 className="font-poly font-bold mb-3 text-center">Détails du retrait</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Coffre
                      </span>
                      <span className="font-semibold">{withdrawalRequest.vaultName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Montant
                      </span>
                      <span className="font-bold text-lg">{withdrawalRequest.amount}€</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        Demandé le
                      </span>
                      <span className="text-sm">
                        {new Date(withdrawalRequest.createdAt.toDate()).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    {withdrawalRequest.reason && (
                      <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-sm font-semibold mb-1">Motif :</p>
                        <p className="text-sm italic">{withdrawalRequest.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-poly font-bold mb-2">
                    Confirmer votre identité
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Entrez votre code d'accès à 12 chiffres pour approuver ce retrait
                  </p>
                </div>

                <form onSubmit={handleApproveWithdrawal} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-poly font-semibold mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <Key className="w-4 h-4 inline mr-2" />
                      Code d'accès
                    </label>
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors text-center font-mono text-lg tracking-widest ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="123456789012"
                      maxLength={12}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !accessCode.trim() || accessCode.length !== 12}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-poly font-bold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Vérification en cours...
                      </span>
                    ) : (
                      'Approuver le retrait'
                    )}
                  </button>
                </form>
              </>
            )}

            {status === 'processing' && (
              <div className="text-center">
                <h2 className="text-xl font-poly font-bold mb-4 text-blue-600 dark:text-blue-400">
                  Vérification en cours...
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Nous vérifions votre code d'accès et traitons votre approbation
                </p>
              </div>
            )}

            {status === 'success' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-poly font-bold mb-2 text-green-600 dark:text-green-400">
                    Approbation réussie !
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {message}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-poly font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  Retour à ARYWO
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
                        <li>• Vérifiez que votre code d'accès est correct</li>
                        <li>• Assurez-vous d'être autorisé à approuver cette demande</li>
                        <li>• Contactez l'utilisateur qui a fait la demande</li>
                        <li>• Réessayez plus tard</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStatus('idle');
                    setMessage('');
                    setAccessCode('');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-poly font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                >
                  Réessayer
                </button>
              </>
            )}

            {message && status !== 'error' && status !== 'success' && (
              <div className="mt-4 text-center">
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
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
            © 2025 ARYWO. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, ArrowDownLeft, AlertTriangle } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, reason: string) => void;
  darkMode: boolean;
  vaultName: string;
  currentBalance: number;
}

export default function WithdrawModal({ 
  isOpen, 
  onClose, 
  onWithdraw, 
  darkMode, 
  vaultName,
  currentBalance 
}: WithdrawModalProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      alert("Veuillez entrer un montant valide !");
      return;
    }
    
    if (Number(amount) > currentBalance) {
      alert("Montant supérieur au solde disponible !");
      return;
    }
    
    if (!reason.trim()) {
      alert("Veuillez indiquer le motif du retrait !");
      return;
    }
    
    onWithdraw(Number(amount), reason.trim());
    setAmount('');
    setReason('');
    onClose();
  };

  const quickReasons = [
    "Urgence médicale",
    "Dépense imprévue",
    "Objectif atteint",
    "Achat planifié",
    "Autre"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`w-full max-w-md mx-auto my-8 rounded-2xl shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
        darkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="relative p-4 sm:p-6 pb-4 sticky top-0 z-10 bg-inherit rounded-t-2xl">
          <button
            onClick={onClose}
            className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <ArrowDownLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-poly font-bold mb-2">
              Retirer des fonds
            </h2>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Coffre: {vaultName}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 pt-2">
          {/* Solde disponible */}
            <div className={`p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 border ${
            darkMode 
              ? 'bg-blue-900/20 border-blue-800 text-blue-300' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="text-xs sm:text-sm font-semibold">Solde disponible:</div>
              <div className="text-base sm:text-lg font-bold">{currentBalance.toLocaleString()} €</div>
            </div>
          </div>

          {/* Montant */}
            <div className="mb-4 sm:mb-6">
              <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Montant à retirer
            </label>
            <div className="relative">
                <div className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-base sm:text-lg font-bold ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                €
              </div>
              <input
                type="number"
                min="1"
                max={currentBalance}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="0"
                  className={`w-full pl-6 sm:pl-8 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl border-2 transition-all duration-200 focus:ring-4 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-red-500/20'
                }`}
                required
              />
            </div>
          </div>

          {/* Motif de retrait */}
            <div className="mb-4 sm:mb-6">
              <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Motif du retrait
            </label>
            
            {/* Boutons de motifs rapides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {quickReasons.map((quickReason) => (
                <button
                  key={quickReason}
                  type="button"
                  onClick={() => setReason(quickReason)}
                    className={`p-2 sm:p-3 text-xs sm:text-sm rounded-lg border transition-colors ${
                    reason === quickReason
                      ? 'border-red-500 bg-red-500/10 text-red-500'
                      : darkMode
                        ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {quickReason}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ou saisissez votre motif..."
              rows={3}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 transition-all duration-200 focus:ring-4 resize-none text-sm sm:text-base ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-red-500/20'
              }`}
              required
            />
          </div>

          {/* Avertissement */}
            <div className={`p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 border ${
            darkMode 
              ? 'bg-orange-900/20 border-orange-800' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              }`} />
                <div className={`text-xs sm:text-sm ${
                darkMode ? 'text-orange-300' : 'text-orange-700'
              }`}>
                Ce retrait sera définitif et ne pourra pas être annulé. Assurez-vous que c'est nécessaire pour votre objectif d'épargne.
              </div>
            </div>
          </div>

          {/* Boutons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
                className={`w-full sm:flex-1 py-3 px-4 sm:px-6 rounded-xl font-semibold transition-colors text-sm sm:text-base ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
                className="w-full sm:flex-1 py-3 px-4 sm:px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
            >
              Retirer
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
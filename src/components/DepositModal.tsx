import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Smartphone } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => void;
  darkMode: boolean;
  vaultName: string;
}

export default function DepositModal({ 
  isOpen, 
  onClose, 
  onDeposit, 
  darkMode, 
  vaultName 
}: DepositModalProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'manual'>('mobile');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert("Veuillez entrer un montant valide !");
      return;
    }
    onDeposit(Number(amount));
    setAmount('');
    onClose();
  };

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
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-poly font-bold mb-2">
              Effectuer un dépôt
            </h2>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Coffre: {vaultName}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 pt-2">
          {/* Montant */}
            <div className="mb-4 sm:mb-6">
              <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Montant à déposer
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
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="0"
                  className={`w-full pl-6 sm:pl-8 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl border-2 transition-all duration-200 focus:ring-4 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500/20'
                }`}
                required
              />
            </div>
          </div>

          {/* Méthode de paiement */}
            <div className="mb-4 sm:mb-6">
              <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Méthode de paiement
            </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('mobile')}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === 'mobile'
                    ? 'border-green-500 bg-green-500/10'
                    : darkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                  <Smartphone className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 ${
                  paymentMethod === 'mobile' ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                  <div className={`text-xs sm:text-sm font-semibold ${
                  paymentMethod === 'mobile' ? 'text-green-500' : darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Mobile Money
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('manual')}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === 'manual'
                    ? 'border-green-500 bg-green-500/10'
                    : darkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                  <CreditCard className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 ${
                  paymentMethod === 'virement' ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                  <div className={`text-xs sm:text-sm font-semibold ${
                  paymentMethod === 'virement' ? 'text-green-500' : darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Virement
                </div>
              </button>
            </div>
          </div>

          {/* Info sur la méthode */}
            <div className={`p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
              <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {paymentMethod === 'mobile' 
                ? '💡 Vous serez redirigé vers KkiaPay pour finaliser le paiement'
                : '💡 Dépôt manuel - le montant sera ajouté directement à votre coffre'
              }
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
                className="w-full sm:flex-1 py-3 px-4 sm:px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
            >
              {paymentMethod === 'mobile' ? 'Payer' : 'Déposer'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
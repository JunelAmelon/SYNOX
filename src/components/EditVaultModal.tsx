import React, { useState } from 'react';
import { useVaults } from '../hooks/useVaults';
import { Vault } from '../hooks/useVaults';

interface EditVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: Vault;
  darkMode: boolean;
}

export default function EditVaultModal({ isOpen, onClose, vault, darkMode }: EditVaultModalProps) {
  const { updateVault } = useVaults();
  const [formData, setFormData] = useState({
    name: vault.name,
    type: vault.type,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await updateVault(vault.id, {
        name: formData.name,
        type: formData.type,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du coffre:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700 text-white' 
    : 'bg-white border-gray-200 text-gray-900';

  const inputClasses = darkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl border max-w-md w-full ${cardClasses}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-xl font-poppins font-bold">Modifier le Coffre</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <span className="w-6 h-6">&times;</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loader */}
          {loading && (
            <div className="flex justify-center items-center py-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-100 text-green-800 rounded-lg text-center">
              Modification réussie !
            </div>
          )}

          {/* Vault Name */}
          <div>
            <label className="block text-sm font-poppins font-semibold mb-2">
              Nom du coffre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${inputClasses}`}
              required
            />
          </div>

          {/* Vault Type */}
          <div>
            <label className="block text-sm font-poppins font-semibold mb-2">
              Type de coffre
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${inputClasses}`}
            >
              <option value="travel">Voyage</option>
              <option value="car">Véhicule</option>
              <option value="home">Immobilier</option>
              <option value="education">Éducation</option>
              <option value="health">Santé</option>
              <option value="shopping">Shopping</option>
              <option value="tech">Technologie</option>
              <option value="emergency">Urgence</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded-xl font-poppins font-semibold hover:bg-amber-600 transition-all duration-200"
              disabled={loading}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

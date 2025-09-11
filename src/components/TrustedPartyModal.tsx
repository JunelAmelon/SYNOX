import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, AlertTriangle } from 'lucide-react';
import { CreateTrustedPartyData, UpdateTrustedPartyData, TrustedThirdParty, Permission, RelationshipType } from '../hooks/useTrustedThirdParties';

interface TrustedPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTrustedPartyData | UpdateTrustedPartyData) => Promise<void>;
  darkMode: boolean;
  editingParty?: TrustedThirdParty | null;
}

export default function TrustedPartyModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  darkMode, 
  editingParty 
}: TrustedPartyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'Autre' as RelationshipType,
    permissions: [] as Permission[],
    notes: '',
    emergencyContactPriority: 3
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editingParty;

  // Remplir le formulaire lors de l'édition
  useEffect(() => {
    if (editingParty) {
      setFormData({
        name: editingParty.name,
        email: editingParty.email,
        phone: editingParty.phone,
        relationship: editingParty.relationship,
        permissions: editingParty.permissions,
        notes: editingParty.notes || '',
        emergencyContactPriority: editingParty.emergencyContactPriority || 3
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        relationship: 'Autre',
        permissions: [],
        notes: '',
        emergencyContactPriority: 3
      });
    }
    setError(null);
  }, [editingParty, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await onSubmit(formData as UpdateTrustedPartyData);
      } else {
        await onSubmit(formData as CreateTrustedPartyData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const permissionLabels: Record<Permission, string> = {
    view_vaults: 'Voir les coffres',
    manage_vaults: 'Gérer les coffres',
    emergency_access: 'Accès d\'urgence',
    view_analytics: 'Voir les analyses',
    approve_withdrawals: 'Approuver les retraits'
  };

  const relationshipOptions: RelationshipType[] = [
    'Famille',
    'Conjoint',
    'Ami proche',
    'Conseiller financier',
    'Autre'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          darkMode ? 'border-gray-600' : 'border-gray-300'
        }`}>
          <h2 className="text-2xl font-poly font-bold">
            {isEditing ? 'Modifier le tiers de confiance' : 'Ajouter un tiers de confiance'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className={`p-4 rounded-xl border ${
              darkMode 
                ? 'bg-red-900/30 border-red-800' 
                : 'bg-red-100 border-red-300'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`w-5 h-5 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} />
                <p className={`${
                  darkMode ? 'text-red-300' : 'text-red-700'
                }`}>{error}</p>
              </div>
            </div>
          )}

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-poly font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <User className="w-4 h-4 inline mr-2" />
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Ex: Marie Dubois"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-poly font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="marie.dubois@email.com"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-poly font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Phone className="w-4 h-4 inline mr-2" />
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="+33 6 12 34 56 78"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-poly font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Relation *
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value as RelationshipType }))}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-stone-200 text-gray-900'
                }`}
                required
              >
                {relationshipOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className={`block text-sm font-poly font-semibold mb-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Shield className="w-4 h-4 inline mr-2" />
              Permissions accordées *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(permissionLabels).map(([permission, label]) => (
                <label key={permission} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.permissions.includes(permission as Permission)
                    ? darkMode
                      ? 'bg-amber-900/30 border-amber-600 text-amber-300'
                      : 'bg-amber-50 border-amber-300 text-amber-700'
                    : darkMode
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission as Permission)}
                    onChange={() => handlePermissionChange(permission as Permission)}
                    className="mr-3 w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className={`text-sm font-medium ${
                    formData.permissions.includes(permission as Permission)
                      ? darkMode ? 'text-amber-300' : 'text-amber-700'
                      : darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priorité d'urgence */}
          <div>
            <label className={`block text-sm font-poly font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Priorité de contact d'urgence
            </label>
            <select
              value={formData.emergencyContactPriority}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPriority: parseInt(e.target.value) }))}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-stone-200 text-gray-900'
              }`}
            >
              <option value={1}>Priorité haute (1)</option>
              <option value={2}>Priorité moyenne (2)</option>
              <option value={3}>Priorité basse (3)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-poly font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Informations supplémentaires sur cette personne..."
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-poly font-semibold transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || formData.permissions.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'En cours...' : isEditing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

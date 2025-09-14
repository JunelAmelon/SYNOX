import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, AlertTriangle, Bell } from 'lucide-react';
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
  const [sendNotification, setSendNotification] = useState(true);

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
        await onSubmit({ ...formData, id: editingParty!.id } as UpdateTrustedPartyData);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl mx-auto my-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 bg-inherit rounded-t-2xl flex items-center justify-between p-4 sm:p-6 border-b ${
          darkMode ? 'border-gray-600' : 'border-gray-300'
        }`}>
          <h2 className="text-xl sm:text-2xl font-poly font-bold">
            {isEditing ? 'Modifier le tiers de confiance' : 'Ajouter un tiers de confiance'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className={`p-3 sm:p-4 rounded-xl border ${
              darkMode 
                ? 'bg-red-900/30 border-red-800' 
                : 'bg-red-100 border-red-300'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} />
                <p className={`text-sm sm:text-base ${
                  darkMode ? 'text-red-300' : 'text-red-700'
                }`}>{error}</p>
              </div>
            </div>
          )}

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={`block text-xs sm:text-sm font-poly font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Ex: Marie Dubois"
                required
              />
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-poly font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="marie.dubois@email.com"
                required
              />
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-poly font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="+33 6 12 34 56 78"
                required
              />
            </div>

            <div>
              <label className={`block text-xs sm:text-sm font-poly font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Relation *
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value as RelationshipType }))}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border transition-colors ${
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
            <label className={`block text-xs sm:text-sm font-poly font-semibold mb-2 sm:mb-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              Permissions accordées *
            </label>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {Object.entries(permissionLabels).map(([permission, label]) => (
                <label key={permission} className={`flex items-center p-2 sm:p-3 rounded-xl border cursor-pointer transition-all ${
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
                    className="mr-2 sm:mr-3 w-3 h-3 sm:w-4 sm:h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className={`text-xs sm:text-sm font-medium ${
                    formData.permissions.includes(permission as Permission)
                      ? darkMode ? 'text-amber-300' : 'text-amber-700'
                      : darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Option de notification (seulement pour la création) */}
          {!isEditing && (
            <div>
              <label className={`flex items-center p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                sendNotification
                  ? darkMode
                    ? 'bg-blue-900/30 border-blue-600 text-blue-300'
                    : 'bg-blue-50 border-blue-300 text-blue-700'
                  : darkMode
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}>
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="mr-2 sm:mr-3 w-3 h-3 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <Bell className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 ${
                  sendNotification
                    ? darkMode ? 'text-blue-300' : 'text-blue-600'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <div>
                  <span className={`text-sm sm:text-base font-medium ${
                    sendNotification
                      ? darkMode ? 'text-blue-300' : 'text-blue-700'
                      : darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Notifier cette personne
                  </span>
                  <p className={`text-xs sm:text-sm mt-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Une notification push sera envoyée pour l'informer qu'elle a été ajoutée comme tiers de confiance
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Priorité d'urgence */}
          <div>
            <label className={`block text-xs sm:text-sm font-poly font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Priorité de contact d'urgence
            </label>
            <select
              value={formData.emergencyContactPriority}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPriority: parseInt(e.target.value) }))}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border transition-colors ${
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
            <label className={`block text-xs sm:text-sm font-poly font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border transition-colors resize-none ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Informations supplémentaires sur cette personne..."
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-poly font-semibold transition-all duration-200 ${
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
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'En cours...' : isEditing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
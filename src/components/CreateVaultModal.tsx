import React, { useState } from 'react';
import { X, Car, Plane, Home, GraduationCap, Heart, ShoppingBag, Smartphone, Vault, Target, Calendar, DollarSign, Plus, Save, Users, Check } from 'lucide-react';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vaultData: any) => void;
  darkMode: boolean;
}

export default function CreateVaultModal({ isOpen, onClose, onSubmit, darkMode }: CreateVaultModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'other',
    customTypeName: '',
    target: '',
    monthlyContrib: '',
    description: '',
    lockDuration: '12',
    autoLock: false,
    isGoalBased: true,
    supervisors: [] as string[]
  });

  // Liste des superviseurs disponibles (normalement récupérée depuis l'API)
  const availableSupervisors = [
    { id: '1', name: 'Marie Dubois', email: 'marie.dubois@email.com', relationship: 'Famille' },
    { id: '2', name: 'Jean Martin', email: 'jean.martin@email.com', relationship: 'Conjoint' },
    { id: '3', name: 'Sophie Leroy', email: 'sophie.leroy@email.com', relationship: 'Ami proche' },
    { id: '4', name: 'Pierre Moreau', email: 'pierre.moreau@email.com', relationship: 'Conseiller financier' },
  ];

  const vaultTypes = [
    { id: 'travel', icon: Plane, name: 'Voyage', color: 'from-blue-500 to-blue-600', description: 'Vacances et voyages' },
    { id: 'car', icon: Car, name: 'Véhicule', color: 'from-purple-500 to-purple-600', description: 'Achat de voiture' },
    { id: 'home', icon: Home, name: 'Immobilier', color: 'from-green-500 to-green-600', description: 'Achat immobilier' },
    { id: 'education', icon: GraduationCap, name: 'Éducation', color: 'from-indigo-500 to-indigo-600', description: 'Formation et études' },
    { id: 'health', icon: Heart, name: 'Santé', color: 'from-red-500 to-red-600', description: 'Frais médicaux' },
    { id: 'shopping', icon: ShoppingBag, name: 'Shopping', color: 'from-pink-500 to-pink-600', description: 'Achats personnels' },
    { id: 'tech', icon: Smartphone, name: 'Technologie', color: 'from-gray-500 to-gray-600', description: 'Équipements tech' },
    { id: 'emergency', icon: Vault, name: 'Urgence', color: 'from-emerald-500 to-emerald-600', description: 'Fonds d\'urgence' },
    { id: 'other', icon: Plus, name: 'Autre', color: 'from-slate-500 to-slate-600', description: 'Objectif personnalisé' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      name: '',
      type: 'other',
      customTypeName: '',
      target: '',
      monthlyContrib: '',
      description: '',
      lockDuration: '12',
      autoLock: false,
      isGoalBased: true,
      supervisors: []
    });
  };

  const toggleSupervisor = (supervisorId: string) => {
    setFormData(prev => ({
      ...prev,
      supervisors: prev.supervisors.includes(supervisorId)
        ? prev.supervisors.filter(id => id !== supervisorId)
        : prev.supervisors.length < 2
          ? [...prev.supervisors, supervisorId]
          : prev.supervisors
    }));
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
      <div className={`rounded-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto ${cardClasses}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600">
          <div>
            <h2 className="text-2xl font-poppins font-bold">Créer un Nouveau Coffre</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Définissez votre objectif d'épargne
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vault Type Selection */}
          <div>
            <label className="block text-sm font-poppins font-semibold mb-3">
              Type de coffre
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {vaultTypes.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.type === type.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : darkMode
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <TypeIcon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-poppins font-semibold">{type.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vault Name */}
          <div>
            <label className="block text-sm font-poppins font-semibold mb-2">
              {formData.type === 'other' ? 'Nom personnalisé du coffre' : 'Nom du coffre'}
            </label>
            <input
              type="text"
              value={formData.type === 'other' ? formData.customTypeName : formData.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                [formData.type === 'other' ? 'customTypeName' : 'name']: e.target.value 
              })}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${inputClasses}`}
              placeholder={formData.type === 'other' ? 'Ex: Ma réserve personnelle' : 'Ex: Voyage en Europe'}
              required
            />
          </div>

          {/* Goal Type Selection */}
          <div>
            <label className="block text-sm font-poppins font-semibold mb-3">
              Type d'épargne
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isGoalBased: true, target: '', monthlyContrib: '' })}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.isGoalBased
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : darkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Target className="w-6 h-6 mb-2 text-amber-600 dark:text-amber-400" />
                <h4 className="font-poppins font-semibold mb-1">Objectif précis</h4>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Épargner pour atteindre un montant cible
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isGoalBased: false, target: '', monthlyContrib: '' })}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  !formData.isGoalBased
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : darkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Vault className="w-6 h-6 mb-2 text-blue-600 dark:text-blue-400" />
                <h4 className="font-poppins font-semibold mb-1">Épargne libre</h4>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stocker de l'argent sans objectif précis
                </p>
              </button>
            </div>
          </div>

          {/* Target Amount and Monthly Contribution - Only for goal-based */}
          {formData.isGoalBased && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-poppins font-semibold mb-2">
                  Objectif (€)
                </label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="number"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${inputClasses}`}
                    placeholder="5000"
                    required={formData.isGoalBased}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-poppins font-semibold mb-2">
                  Contribution mensuelle (€) - <span className="text-xs font-normal">Optionnel</span>
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="number"
                    value={formData.monthlyContrib}
                    onChange={(e) => setFormData({ ...formData, monthlyContrib: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${inputClasses}`}
                    placeholder="250 (optionnel)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Initial Amount - Only for free savings */}
          {!formData.isGoalBased && (
            <div>
              <label className="block text-sm font-poppins font-semibold mb-2">
                Montant initial (€) - <span className="text-xs font-normal">Optionnel</span>
              </label>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors ${inputClasses}`}
                  placeholder="1000 (optionnel)"
                />
              </div>
            </div>
          )}

          {/* Superviseurs pour retraits d'urgence */}
          <div>
            <label className="block text-sm font-poppins font-semibold mb-3">
              Superviseurs pour retraits d'urgence <span className="text-red-500">*</span>
            </label>
            <p className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sélectionnez exactement 2 personnes qui devront valider vos demandes de retrait d'urgence
            </p>
            <div className="space-y-3">
              {availableSupervisors.map((supervisor) => (
                <div
                  key={supervisor.id}
                  onClick={() => toggleSupervisor(supervisor.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.supervisors.includes(supervisor.id)
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : darkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-poppins font-bold text-sm">
                          {supervisor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-poppins font-semibold">{supervisor.name}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {supervisor.relationship} • {supervisor.email}
                        </p>
                      </div>
                    </div>
                    {formData.supervisors.includes(supervisor.id) && (
                      <Check className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {formData.supervisors.length !== 2 && (
              <p className={`text-xs mt-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                {formData.supervisors.length === 0 
                  ? 'Veuillez sélectionner 2 superviseurs'
                  : formData.supervisors.length === 1
                    ? 'Veuillez sélectionner 1 superviseur supplémentaire'
                    : 'Maximum 2 superviseurs autorisés'
                }
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-poppins font-semibold mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${inputClasses}`}
              rows={3}
              placeholder="Décrivez votre objectif d'épargne..."
            />
          </div>

          {/* Lock Duration */}
          <div>
            <label className="block text-sm font-poppins font-semibold mb-2">
              Durée de verrouillage (mois)
            </label>
            <select
              value={formData.lockDuration}
              onChange={(e) => setFormData({ ...formData, lockDuration: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${inputClasses}`}
            >
              <option value="6">6 mois</option>
              <option value="12">12 mois</option>
              <option value="18">18 mois</option>
              <option value="24">24 mois</option>
              <option value="36">36 mois</option>
            </select>
          </div>

          {/* Auto Lock */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-poppins font-semibold">Verrouillage automatique</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Verrouiller automatiquement à l'objectif atteint
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoLock}
                onChange={(e) => setFormData({ ...formData, autoLock: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Estimated Time */}
          {formData.isGoalBased && formData.target && formData.monthlyContrib && (
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-poppins font-semibold text-blue-700 dark:text-blue-300">
                  Estimation
                </h4>
              </div>
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                Temps estimé pour atteindre l'objectif : {' '}
                <span className="font-poppins font-bold">
                  {Math.ceil(parseInt(formData.target) / parseInt(formData.monthlyContrib))} mois
                </span>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-poppins font-semibold transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={formData.supervisors.length !== 2}
              className={`flex items-center px-6 py-3 rounded-xl font-poppins font-bold transition-all duration-200 shadow-lg ${
                formData.supervisors.length === 2
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              }`}
            >
              <Save className="w-5 h-5 mr-2" />
              Créer le coffre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
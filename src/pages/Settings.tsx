import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  CreditCard,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Camera,
  Mail,
  Phone,
  Lock,
  Smartphone,
  Moon,
  Sun
} from 'lucide-react';

interface SettingsProps {
  onLogout: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Listen for dark mode changes
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700 text-white' 
    : 'bg-white border-gray-200 text-gray-900';

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'privacy', label: 'Confidentialité', icon: Lock },
    { id: 'account', label: 'Compte', icon: SettingsIcon },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="font-poly font-bold text-xl">Sophie Martin</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Membre Premium</p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Membre depuis juin 2024</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-poly font-semibold mb-2">Prénom</label>
                <input
                  type="text"
                  defaultValue="Sophie"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-stone-200 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-poly font-semibold mb-2">Nom</label>
                <input
                  type="text"
                  defaultValue="Martin"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-stone-200 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-poly font-semibold mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="sophie.martin@email.com"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-stone-200 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-poly font-semibold mb-2">Téléphone</label>
                <input
                  type="tel"
                  defaultValue="+33 6 12 34 56 78"
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-stone-200 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <button className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200">
              <Save className="w-5 h-5 mr-2" />
              Sauvegarder les modifications
            </button>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${cardClasses}`}>
              <h3 className="font-poly font-bold text-lg mb-4">Changer le mot de passe</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-poly font-semibold mb-2">Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-stone-200 text-gray-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-poly font-semibold mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-stone-200 text-gray-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button className="px-6 py-3 bg-blue-500 text-white rounded-xl font-poly font-bold hover:bg-blue-600 transition-colors">
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${cardClasses}`}>
              <h3 className="font-poly font-bold text-lg mb-4">Authentification à deux facteurs</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-poly font-semibold">2FA activée</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Protection supplémentaire pour votre compte
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-poly font-semibold">
                    Activée
                  </span>
                  <button className={`px-4 py-2 rounded-xl transition-colors ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-stone-100 text-gray-600 hover:bg-stone-200'
                  }`}>
                    Configurer
                  </button>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${cardClasses}`}>
              <h3 className="font-poly font-bold text-lg mb-4">Sessions actives</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5" />
                    <div>
                      <p className="font-poly font-semibold">iPhone 14 Pro</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Paris, France • Maintenant
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-poly font-semibold">
                    Actuelle
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${cardClasses}`}>
              <h3 className="font-poly font-bold text-lg mb-4">Notifications par email</h3>
              <div className="space-y-4">
                {[
                  { label: 'Objectifs atteints', description: 'Quand un coffre atteint son objectif' },
                  { label: 'Contributions mensuelles', description: 'Rappels de contributions automatiques' },
                  { label: 'Alertes de sécurité', description: 'Activité suspecte sur votre compte' },
                  { label: 'Rapports mensuels', description: 'Résumé de vos performances d\'épargne' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-poly font-semibold">{item.label}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${cardClasses}`}>
              <h3 className="font-poly font-bold text-lg mb-4">Notifications push</h3>
              <div className="space-y-4">
                {[
                  { label: 'Notifications instantanées', description: 'Recevoir les notifications en temps réel' },
                  { label: 'Rappels quotidiens', description: 'Rappel quotidien de vos objectifs' },
                  { label: 'Alertes importantes', description: 'Notifications critiques uniquement' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-poly font-semibold">{item.label}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={index !== 1} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${cardClasses}`}>
              <h3 className="font-poly font-bold text-lg mb-4">Thème</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'light', label: 'Clair', icon: Sun },
                  { id: 'dark', label: 'Sombre', icon: Moon },
                  { id: 'system', label: 'Système', icon: Smartphone },
                ].map((theme) => {
                  const ThemeIcon = theme.icon;
                  return (
                    <button
                      key={theme.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        theme.id === 'light' 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                          : darkMode 
                            ? 'border-gray-600 hover:border-gray-500' 
                            : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <ThemeIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-poly font-semibold">{theme.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${cardClasses}`}>
              <h3 className="font-poly font-bold text-lg mb-4">Langue</h3>
              <select className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-stone-200 text-gray-900'
              }`}>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${cardClasses}`}>
              <h3 className="font-poly font-bold text-lg mb-4">Confidentialité des données</h3>
              <div className="space-y-4">
                {[
                  { label: 'Partage des données analytiques', description: 'Aider à améliorer l\'application' },
                  { label: 'Données de localisation', description: 'Pour les fonctionnalités basées sur la localisation' },
                  { label: 'Cookies de performance', description: 'Améliorer les performances de l\'application' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-poly font-semibold">{item.label}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={index === 0} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${cardClasses}`}>
              <h3 className="font-poly font-bold text-lg mb-4">Exporter les données</h3>
              <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Téléchargez une copie de toutes vos données SYNOX
              </p>
              <button className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl font-poly font-bold hover:bg-blue-600 transition-colors">
                <Download className="w-5 h-5 mr-2" />
                Exporter mes données
              </button>
            </div>

            <div className={`p-6 rounded-2xl border-2 ${
              darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
            }`}>
              <h3 className="font-poly font-bold text-lg mb-4 text-red-700 dark:text-red-400">
                Zone de danger
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-poly font-semibold mb-2 text-red-700 dark:text-red-400">
                    Supprimer le compte
                  </h4>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
                    Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                  </p>
                  <button className="flex items-center px-6 py-3 bg-red-500 text-white rounded-xl font-poly font-bold hover:bg-red-600 transition-colors">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-poly font-bold mb-2">
            Paramètres
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Personnalisez votre expérience SYNOX
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl border p-6 ${cardClasses}`}>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                        activeTab === tab.id 
                          ? darkMode 
                            ? 'bg-amber-500/20 text-amber-400 font-poly font-bold' 
                            : 'bg-amber-50 text-amber-700 font-poly font-bold'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-600 hover:bg-stone-50 hover:text-gray-900'
                      }`}
                    >
                      <TabIcon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className={`rounded-2xl border p-6 ${cardClasses}`}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
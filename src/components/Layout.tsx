import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db, auth } from "../firebase/firebase";
import { useKKiaPay } from 'kkiapay-react';
import { collection, onSnapshot, query, where, getDocs, addDoc, orderBy, increment, doc, updateDoc } from "firebase/firestore";

import { 
  Vault, 
  TrendingUp, 
  Target, 
  CreditCard,
  Users,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();
  const [vaultCount, setVaultCount] = useState<number>(0);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Vérification de l'authentification
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "vaults"),
      where("userId", "==", user.uid)
    );

    // ✅ écoute en temps réel
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVaultCount(snapshot.size); // nombre de docs
      console.log("Nombre de coffres :", snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  // Apply dark mode to document
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const themeClasses = darkMode 
    ? 'dark bg-gray-900 text-white' 
    : 'bg-gray-50 text-gray-900';

  // Afficher un loader pendant la vérification d'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur connecté, ne pas afficher le layout
  if (!currentUser) {
    return null;
  }

  const menuItems = [
    { path: '/dashboard', icon: TrendingUp, label: 'Dashboard' },
    { path: '/vaults', icon: Vault, label: 'Coffres d\'Épargne', badge: vaultCount },
    { path: '/analytics', icon: Target, label: 'Analyses' },
    { path: '/transactions', icon: CreditCard, label: 'Transactions' },
    { path: '/trusted-parties', icon: Users, label: 'Tiers de confiance' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* Header */}
      <header className={`h-24 flex items-center border-b transition-colors duration-300 px-4 sm:px-6 lg:px-8 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden p-2 rounded-lg mr-3 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <img 
              src={darkMode ? "/logo-blanc.png" : "/logo-noir.png"} 
              alt="SYNOX Logo" 
              className="h-[140px] sm:h-[170px] md:h-[180px] lg:h-[200px] w-auto object-contain"
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <button  
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                darkMode 
                  ? 'text-amber-400 hover:bg-gray-700 bg-gray-700/50' 
                  : 'text-amber-600 hover:bg-amber-50 bg-amber-50/50'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link 
              to="/notifications"
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-5 h-5" />
            </Link>
            <Link
              className="hidden sm:block"
              to="/settings"
            >
              <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}>
                <Settings className="w-5 h-5" />
              </div>
            </Link>
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-300 dark:border-gray-600">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="font-poppins font-bold text-sm">
                  {currentUser?.displayName || 'Utilisateur'}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentUser?.emailVerified ? 'Compte vérifié' : 'En attente de vérification'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 border-r min-h-screen transition-all duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <nav className="p-6 pt-6">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center px-4 py-3.5 text-left rounded-xl transition-all duration-200 ${
                      isActive 
                        ? darkMode 
                          ? 'bg-amber-500/20 text-amber-400 font-poppins font-bold shadow-lg' 
                          : 'bg-amber-50 text-amber-700 font-poppins font-bold shadow-lg'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                    {item.badge && (
                      <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                        darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
              <button 
                onClick={handleLogout}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Déconnexion
              </button>
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen pb-20 lg:pb-6">
          {children}
          
          {/* Footer */}
          <footer className={`mt-16 pt-4 pb-2 border-t transition-colors duration-300 ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <img 
                    src={darkMode ? "/logo-blanc.png" : "/logo-noir.png"} 
                    alt="SYNOX Logo" 
                    className="w-[200px] h-auto"
                  />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
                  <div className="flex items-center space-x-6 mb-4 md:mb-0">
                    <a href="#" className={`text-sm transition-colors ${
                      darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}>
                      Aide & Support
                    </a>
                    <a href="#" className={`text-sm transition-colors ${
                      darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}>
                      Confidentialité
                    </a>
                    <a href="#" className={`text-sm transition-colors ${
                      darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}>
                      Conditions
                    </a>
                  </div>
                  
                  <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    © 2025 SYNOX. Tous droits réservés.
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 border-t px-4 py-2 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-around">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : darkMode ? 'text-gray-400' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-poppins">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import CreateVaultModal from '../components/CreateVaultModal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useAuth } from '../hooks/useAuth';
import { onAuthStateChanged } from "firebase/auth";
import { useVaults, CreateVaultData } from '../hooks/useVaults';
import { useToastContext } from '../contexts/ToastContext';
import { Link } from "react-router-dom";

import { 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  CreditCard,
  Wallet,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Eye,
  EyeOff,
  Car,
  Plane,
  Home,
  GraduationCap,
  Heart,
  ShoppingBag,
  Smartphone,
  Vault,
  Target, 
  X, 
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  userName: string;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const { currentUser, loading, logout } = useAuth();
  const { createVault } = useVaults();
  const { success, error: showError } = useToastContext();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [showBalance, setShowBalance] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savingsVaults, setSavingsVaults] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // États pour la recherche de transactions
  const [showTransactionSearch, setShowTransactionSearch] = useState(false);
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'dashboard' | 'transactions'>('dashboard');
  
  // États pour le calendrier
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCreateVault = async (vaultData: CreateVaultData) => {
    try {
      console.log('🚀 [Dashboard] Création du coffre:', vaultData);
      await createVault(vaultData);
      setShowCreateModal(false);
      success('Coffre créé avec succès !');
      console.log('✅ [Dashboard] Coffre créé et modal fermé');
    } catch (err) {
      console.error('❌ [Dashboard] Erreur lors de la création du coffre:', err);
      showError('Erreur lors de la création du coffre. Veuillez réessayer.');
    }
  };

  // Fonction pour filtrer les transactions
  const filteredTransactions = useMemo(() => {
    if (!transactionSearchTerm.trim()) {
      return transactions;
    }
    
    return transactions.filter(transaction => 
      transaction.type?.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.montant.toString().includes(transactionSearchTerm)
    );
  }, [transactions, transactionSearchTerm]);

  useEffect(() => {
    // Attendre que l'authentification soit terminée
    if (loading) return;
    if (!currentUser) return;
  
    const vaultsCollection = collection(db, "vaults");
  
    // onSnapshot avec filtrage par userId et tri par date de création (les 3 plus récents)
    const q = query(
      vaultsCollection, 
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vaultsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .slice(0, 3); // Limiter aux 3 derniers coffres créés
      
      setSavingsVaults(vaultsData); // ⚡ mise à jour de ton state
      console.log("📦 [Dashboard] 3 derniers coffres récupérés:", vaultsData);
    }, (error) => {
      console.error("Erreur lors de la récupération des coffres:", error);
    });
  
    return () => unsubscribe(); // Cleanup à la désinstallation
  }, [loading, currentUser]);
  
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Utilisateur connecté :", user.uid);
  
        // Requête Firestore pour récupérer les transactions de l'utilisateur
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid)
        );
  
        const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
          const results: any[] = [];
          snapshot.forEach((doc) => results.push({ id: doc.id, ...doc.data() }));
  
          // Trier par createdAt descendant et ne prendre que les 3 dernières
          const sorted = results
            .sort((a, b) => (b.createdAt?.toDate?.() || new Date()).getTime() - (a.createdAt?.toDate?.() || new Date()).getTime())
            .slice(0, 3);
  
          console.log("Dernières transactions :", sorted);
          setTransactions(sorted);
        }, (error) => {
          console.error("Erreur Firestore :", error);
        });
  
        return () => unsubscribeTransactions();
      } else {
        console.log("Pas d'utilisateur connecté");
        setTransactions([]);
      }
    });
  
    return () => unsubscribeAuth();
  }, []);

  // Listen for dark mode changes
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Types de coffres avec icônes
  const vaultTypes = {
    travel: { icon: Plane, name: 'Voyage', color: 'from-blue-500 to-blue-600' },
    car: { icon: Car, name: 'Véhicule', color: 'from-purple-500 to-purple-600' },
    home: { icon: Home, name: 'Immobilier', color: 'from-green-500 to-green-600' },
    education: { icon: GraduationCap, name: 'Éducation', color: 'from-indigo-500 to-indigo-600' },
    health: { icon: Heart, name: 'Santé', color: 'from-red-500 to-red-600' },
    shopping: { icon: ShoppingBag, name: 'Shopping', color: 'from-pink-500 to-pink-600' },
    tech: { icon: Smartphone, name: 'Technologie', color: 'from-gray-500 to-gray-600' },
    emergency: { icon: Vault, name: 'Urgence', color: 'from-emerald-500 to-emerald-600' },
    other: { icon: Plus, name: 'Autre', color: 'from-slate-500 to-slate-600' }
  };

  // Calculs dynamiques pour les stats
  const totalBalance = savingsVaults.reduce((sum, vault) => sum + (vault.current || 0), 0);
  const totalInVaults = savingsVaults.reduce((sum, vault) => sum + (vault.current || 0), 0);
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const expensesThisMonth = transactions
    .filter(tx => tx.type === 'expense')
    .filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  
  const goalVaults = savingsVaults.filter(vault => vault.target);
  const averageProgress = goalVaults.length > 0
    ? Math.round(goalVaults.reduce((sum, v) => sum + (v.current / v.target) * 100, 0) / goalVaults.length)
    : 0;

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700 text-white' 
    : 'bg-white border-gray-200 text-gray-900';

  const hoverClasses = darkMode 
    ? 'hover:bg-gray-700/50' 
    : 'hover:bg-gray-50';

  return (
    <Layout onLogout={onLogout}>
      <div className="pt-4 px-4 sm:pt-6 sm:px-6 lg:pt-8 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
  <div className="flex-1">
    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-poppins font-bold mb-2">
      Bonjour {currentUser?.displayName || 'Utilisateur'} !
    </h1>
    <p className={`text-sm sm:text-base lg:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      Voici un aperçu de vos coffres d'épargne aujourd'hui
    </p>
  </div>
  
  {/* Calendrier - caché sur très petit écran, visible à partir de sm */}
  <div className=" sm:block">
    <div className="relative">
      <button 
        onClick={() => setShowDatePicker(!showDatePicker)}
        className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
          showDatePicker
            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
            : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Calendar className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">
          {selectedDate.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </span>
      </button>
      
      {showDatePicker && (
        <div className="absolute right-0 top-12 z-50">
          <div className={`rounded-xl shadow-2xl border p-4 ${
            darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="mb-3">
              <h3 className={`text-sm font-semibold ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Sélectionner une période
              </h3>
            </div>
            
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date) => {
                setSelectedDate(date);
                setShowDatePicker(false);
              }}
              inline
              locale="fr"
              className={darkMode ? 'dark-datepicker' : 'light-datepicker'}
            />
            
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setShowDatePicker(false);
                }}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => {
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  setSelectedDate(lastWeek);
                  setShowDatePicker(false);
                }}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                7 jours
              </button>
              <button
                onClick={() => {
                  const lastMonth = new Date();
                  lastMonth.setMonth(lastMonth.getMonth() - 1);
                  setSelectedDate(lastMonth);
                  setShowDatePicker(false);
                }}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                30 jours
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

 

          
          {/* Indicateur de période sélectionnée */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${
            darkMode 
              ? 'bg-blue-900/30 text-blue-400 border border-blue-800' 
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <Calendar className="w-4 h-4" />
            <span className="ml-2">
              Données pour le {selectedDate.toLocaleDateString('fr-FR', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:scale-105 ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center">
                <ArrowUpRight className="w-5 h-5 text-emerald-500 mr-1" />
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className={`p-1 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-stone-100'
                  }`}
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <h3 className="font-poppins font-bold text-3xl mb-1">
              {showBalance ? `${totalBalance.toLocaleString()} CFA` : '••••• CFA'}
            </h3>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Solde total disponible
            </p>
            <p className="text-emerald-600 text-sm font-poppins font-bold">+5.2% ce mois</p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:scale-105 ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Vault className="w-7 h-7 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-poppins font-bold text-3xl mb-1">
              {showBalance ? `${totalInVaults.toLocaleString()} CFA` : '••••• CFA'}
            </h3>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total dans les coffres
            </p>
            <p className="text-blue-600 text-sm font-poppins font-bold">+12.8% ce mois</p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:scale-105 ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <ArrowDownRight className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-poppins font-bold text-3xl mb-1">
              {expensesThisMonth.toLocaleString()} CFA
            </h3>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Dépenses ce mois
            </p>
            <p className="text-red-600 text-sm font-poppins font-bold">-3.1% vs mois dernier</p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:scale-105 ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-poppins font-bold text-3xl mb-1">
              {averageProgress}%
            </h3>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Progression moyenne
            </p>
            <p className="text-emerald-600 text-sm font-poppins font-bold">2/3 coffres actifs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Savings Vaults */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl p-3 sm:p-4 lg:p-6 border transition-colors duration-300 ${cardClasses}`}>
              {/* Header responsive */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-poppins font-bold leading-tight">
                  Mes Coffres d'Épargne
                </h2>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poppins font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="whitespace-nowrap">Nouveau Coffre</span>
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {savingsVaults.map((vault) => {
                  const VaultIcon = vaultTypes[vault.type]?.icon || Plus;
                  const vaultTypeInfo = vaultTypes[vault.type] || { color: 'from-gray-400 to-gray-500', icon: Plus };

                  return (
                    <div key={vault.id} className={`p-3 sm:p-4 lg:p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                      darkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      {/* Header du vault - responsive */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${vaultTypeInfo.color} rounded-xl flex items-center justify-center shadow-lg mr-3 sm:mr-4 flex-shrink-0`}>
                            <VaultIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-poppins font-bold text-base sm:text-lg leading-tight truncate pr-2">
                              {vault.name}
                            </h3>
                            <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                              {vault.isGoalBased && vault.monthlyContrib 
                                ? `${vault.monthlyContrib}CFA/mois • ${vault.daysLeft} jours restants`
                                : vault.isGoalBased 
                                  ? `Objectif: ${vault.target?.toLocaleString()}CFA`
                                  : 'Épargne libre'
                              }
                            </p>
                          </div>
                        </div>
                        
                        {/* Montants - responsive */}
                        <div className="text-left sm:text-right flex-shrink-0">
                          {vault.target ? (
                            <>
                              <p className="font-poppins font-bold text-base sm:text-lg leading-tight">
                                <span className="block sm:inline">{vault.current.toLocaleString()} CFA</span>
                                <span className="hidden sm:inline"> / </span>
                                <span className="block sm:inline text-sm sm:text-base text-gray-500">
                                  {vault.target.toLocaleString()} CFA
                                </span>
                              </p>
                              <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {Math.round((vault.current / vault.target) * 100)}% complété
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-poppins font-bold text-base sm:text-lg">
                                {vault.current.toLocaleString()} CFA
                              </p>
                              <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Épargne libre
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Barre de progression */}
                      {vault.target && (
                        <div className="relative mb-3 sm:mb-4">
                          <div className={`w-full h-3 sm:h-4 rounded-full ${
                            darkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <div 
                              className={`h-3 sm:h-4 rounded-full bg-gradient-to-r ${vaultTypeInfo.color} transition-all duration-500 shadow-lg`}
                              style={{ width: `${Math.min((vault.current / vault.target) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1 sm:mt-2 text-xs">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>0CFA</span>
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                              {vault.target.toLocaleString()}CFA
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Footer du vault */}
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-600">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-poppins font-semibold ${
                            vault.status === 'locked' 
                              ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {vault.status === 'locked' ? 'Verrouillé' : 'Actif'}
                          </span>
                        </div>
                        <button className={`p-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-200 ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className={`rounded-2xl p-3 sm:p-4 lg:p-6 border transition-colors duration-300 ${cardClasses}`}>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-poppins font-bold">Transactions Récentes</h2>
                <button 
                  onClick={() => setShowTransactionSearch(!showTransactionSearch)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    showTransactionSearch 
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Barre de recherche */}
              {showTransactionSearch && (
                <div className="mb-4 sm:mb-6">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      value={transactionSearchTerm}
                      onChange={(e) => setTransactionSearchTerm(e.target.value)}
                      placeholder="Rechercher une transaction..."
                      className={`w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-xl border transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-amber-500' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-amber-500'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500/20`}
                    />
                    {transactionSearchTerm && (
                      <button
                        onClick={() => setTransactionSearchTerm('')}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                          darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2 sm:space-y-3">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.slice(0, 5).map((transaction) => {
                    const TransactionIcon = transaction.icon || DollarSign;
                    return (
                      <div key={transaction.id} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all duration-200 ${hoverClasses}`}>
                        <div className="flex items-center min-w-0 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            darkMode ? 'bg-gray-700' : 'bg-gray-50'
                          }`}>
                            <TransactionIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              transaction.montant > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`} />
                          </div>
                          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                            <p className="font-poppins font-bold text-xs sm:text-sm truncate">
                              {transaction.type}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                              {transaction.category || 'Général'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className={`font-poppins font-bold text-xs sm:text-sm ${
                            transaction.montant > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaction.montant > 0 ? '+' : ''}{Math.abs(transaction.montant).toLocaleString()} CFA
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {transaction.createdAt?.toDate?.().toLocaleDateString('fr-FR') || 'Date inconnue'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : transactionSearchTerm ? (
                  <div className="text-center py-8">
                    <Search className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Aucune transaction trouvée pour "{transactionSearchTerm}"
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Aucune transaction récente
                    </p>
                  </div>
                )}
              </div>

              {/* Bouton voir toutes les transactions - Centré */}
              <div className="flex justify-center mt-4 sm:mt-6">
                <Link
                  to="/transactions"
                  className={`inline-flex items-center justify-center px-6 py-2 sm:py-3 font-poppins font-bold transition-all duration-200 rounded-xl text-sm sm:text-base ${
                    darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Voir toutes les transactions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Vault Modal */}
      <CreateVaultModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateVault}
        darkMode={darkMode}
      />
    </Layout>
  );
}
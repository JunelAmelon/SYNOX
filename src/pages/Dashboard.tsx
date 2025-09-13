import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CreateVaultModal from '../components/CreateVaultModal';
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useAuth } from '../hooks/useAuth';
import { onAuthStateChanged } from "firebase/auth";
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
  Target
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  userName: string;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const { currentUser, loading, logout } = useAuth();
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

  const handleCreateVault = (vaultData: any) => {
    console.log('Nouveau coffre créé:', vaultData);
    // Ici vous pourriez ajouter la logique pour sauvegarder le coffre
    // Par exemple, l'ajouter à la liste des coffres existants
  };


  useEffect(() => {
    const currentUser = auth.currentUser; // 🔑 récupère le user connecté
    if (!currentUser) return; // pas connecté → on sort
  
    const vaultsCollection = collection(db, "vaults");
  
    // onSnapshot avec filtrage par userId
    const q = query(vaultsCollection, where("userId", "==", currentUser.uid));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vaultsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavingsVaults(vaultsData); // ⚡ mise à jour de ton state
      console.log("Coffres récupérés pour l'utilisateur :", vaultsData);
    }, (error) => {
      console.error("Erreur lors de la récupération des coffres:", error);
    });
  
    return () => unsubscribe(); // Cleanup à la désinstallation
  }, []); // Pas de dépendance nécessaire, on prend directement auth.currentUser
  

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

  // const savingsVaults = [
  //   { 
  //     name: 'Coffre Voyage Europe', 
  //     current: 2500, 
  //     target: 5000, 
  //     type: 'travel',
  //     status: 'active',
  //     monthlyContrib: 250,
  //     daysLeft: 180,
  //     isGoalBased: true
  //   },
  //   { 
  //     name: 'Coffre Sécurité', 
  //     current: 8000, 
  //     target: 10000, 
  //     type: 'emergency',
  //     status: 'locked',
  //     monthlyContrib: null,
  //     daysLeft: null,
  //     isGoalBased: false
  //   },
  //   { 
  //     name: 'Coffre Auto Premium', 
  //     current: 1200, 
  //     target: 15000, 
  //     type: 'car',
  //     status: 'active',
  //     monthlyContrib: 500,
  //     daysLeft: 720,
  //     isGoalBased: true
  //   },
  //   { 
  //     name: 'Réserve Personnelle', 
  //     current: 3200, 
  //     target: null, 
  //     type: 'other',
  //     status: 'active',
  //     monthlyContrib: null,
  //     daysLeft: null,
  //     isGoalBased: false
  //   },
  // ];

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
            <div className="flex items-center justify-between mb-4">
              <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-poppins font-bold mb-2">
      Bonjour {  currentUser?.displayName } !
    </h1>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Voici un aperçu de vos coffres d'épargne aujourd'hui
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                  <Filter className="w-4 h-4" />
                </button>
                <button className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
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
  {showBalance ? `${totalBalance.toLocaleString()} €` : '••••• €'}
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
  {showBalance ? `${totalInVaults.toLocaleString()} €` : '••••• €'}
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
{/* Dépenses ce mois */}
<h3 className="font-poppins font-bold text-3xl mb-1">
  {expensesThisMonth.toLocaleString()} €
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

{/* Progression moyenne */}
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
      <div className={`rounded-2xl p-6 border transition-colors duration-300 ${cardClasses}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-poppins font-bold">Mes Coffres d'Épargne</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poppins font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Coffre
          </button>
        </div>

        <div className="space-y-6">
          {savingsVaults.map((vault) => {
            const VaultIcon = vaultTypes[vault.type]?.icon || Plus;
            const vaultTypeInfo = vaultTypes[vault.type] || { color: 'from-gray-400 to-gray-500', icon: Plus };

            return (
              <div key={vault.id} className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                darkMode ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${vaultTypeInfo.color} rounded-xl flex items-center justify-center shadow-lg mr-4`}>
                      <VaultIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-bold text-lg">{vault.name}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {vault.isGoalBased && vault.monthlyContrib 
                          ? `${vault.monthlyContrib}€/mois • ${vault.daysLeft} jours restants`
                          : vault.isGoalBased 
                            ? `Objectif: ${vault.target?.toLocaleString()}€`
                            : 'Épargne libre'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {vault.target ? (
                      <>
                        <p className="font-poppins font-bold text-lg">
                          {vault.current.toLocaleString()} € / {vault.target.toLocaleString()} €
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {Math.round((vault.current / vault.target) * 100)}% complété
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-poppins font-bold text-lg">
                          {vault.current.toLocaleString()} €
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Épargne libre
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {vault.target && (
                  <div className="relative">
                    <div className={`w-full h-4 rounded-full ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-4 rounded-full bg-gradient-to-r ${vaultTypeInfo.color} transition-all duration-500 shadow-lg`}
                        style={{ width: `${(vault.current / vault.target) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>0€</span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {vault.target.toLocaleString()}€
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-poppins font-semibold ${
                      vault.status === 'locked' 
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {vault.status === 'locked' ? 'Verrouillé' : 'Actif'}
                    </span>
                  </div>
                  <button className={`px-4 py-2 rounded-lg transition-all duration-200 ${
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
              <div className={`rounded-2xl p-6 border transition-colors duration-300 ${cardClasses}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-poppins font-bold">Transactions Récentes</h2>
                  <button className={`p-2 rounded-lg transition-all duration-200 ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}>
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                {transactions.length > 0 ? (
  transactions.map((transaction) => {
    const TransactionIcon = transaction.icon || DollarSign; // fallback icon
    return (
      <div key={transaction.id} className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${hoverClasses}`}>
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <TransactionIcon className={`w-5 h-5 ${
              transaction.montant > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`} />
          </div>
          <div className="ml-4">
            <p className="font-poppins font-bold text-sm">{transaction.type}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{transaction.category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-poppins font-bold text-sm ${
            transaction.montant > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {transaction.montant > 0 ? '+' : ''}{transaction.montant} €
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {transaction.createdAt?.toDate?.().toLocaleDateString() || ''}
          </p>
        </div>
      </div>
    );
  })
) : (
  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aucune transaction récente</p>
)}

                </div>

                <button className={`w-full mt-6 py-3 text-center font-poppins font-bold transition-all duration-200 rounded-xl ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                  Voir toutes les transactions
                </button>
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
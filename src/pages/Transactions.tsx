import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  CreditCard,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Car,
  Plane,
  Home,
  ShoppingBag,
  Smartphone,
  Vault,
  MoreHorizontal
} from 'lucide-react';

interface TransactionsProps {
  onLogout: () => void;
}

export default function Transactions({ onLogout }: TransactionsProps) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('30days');

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

  const transactions = [
    { id: 1, type: 'income', description: 'Salaire Mensuel', amount: 3500, date: '2025-01-15', time: '09:00', category: 'Revenus', icon: DollarSign, status: 'completed' },
    { id: 2, type: 'vault', description: 'Coffre Voyage Europe', amount: -250, date: '2025-01-14', time: '14:30', category: 'Épargne', icon: Plane, status: 'completed' },
    { id: 3, type: 'expense', description: 'Courses Premium Market', amount: -120, date: '2025-01-14', time: '11:15', category: 'Alimentation', icon: ShoppingBag, status: 'completed' },
    { id: 4, type: 'expense', description: 'Carburant Total', amount: -65, date: '2025-01-13', time: '16:45', category: 'Transport', icon: Car, status: 'completed' },
    { id: 5, type: 'income', description: 'Freelance Design Project', amount: 800, date: '2025-01-12', time: '10:20', category: 'Revenus', icon: Smartphone, status: 'completed' },
    { id: 6, type: 'vault', description: 'Coffre Sécurité', amount: -400, date: '2025-01-11', time: '08:00', category: 'Épargne', icon: Vault, status: 'completed' },
    { id: 7, type: 'expense', description: 'Abonnement Netflix', amount: -15.99, date: '2025-01-10', time: '12:00', category: 'Divertissement', icon: Smartphone, status: 'completed' },
    { id: 8, type: 'vault', description: 'Coffre Auto Premium', amount: -500, date: '2025-01-09', time: '15:30', category: 'Épargne', icon: Car, status: 'completed' },
    { id: 9, type: 'income', description: 'Remboursement Assurance', amount: 150, date: '2025-01-08', time: '13:45', category: 'Remboursements', icon: DollarSign, status: 'completed' },
    { id: 10, type: 'expense', description: 'Restaurant Le Gourmet', amount: -85, date: '2025-01-07', time: '19:30', category: 'Restaurants', icon: ShoppingBag, status: 'completed' },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const totalSavings = Math.abs(transactions.filter(t => t.type === 'vault').reduce((sum, t) => sum + t.amount, 0));

  return (
    <Layout onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-poly font-bold mb-2">
                Historique des Transactions
              </h1>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Suivez tous vos mouvements financiers en détail
              </p>
            </div>
            <button className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mt-4 sm:mt-0">
              <Download className="w-5 h-5 mr-2" />
              Exporter
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Rechercher une transaction..."
                className={`px-4 py-2 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-stone-200 text-gray-900'
              }`}
            >
              <option value="all">Toutes les transactions</option>
              <option value="income">Revenus</option>
              <option value="expense">Dépenses</option>
              <option value="vault">Épargne</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-stone-200 text-gray-900'
              }`}
            >
              <option value="7days">7 derniers jours</option>
              <option value="30days">30 derniers jours</option>
              <option value="3months">3 derniers mois</option>
              <option value="1year">1 an</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1 text-emerald-600 dark:text-emerald-400">
              +{totalIncome.toLocaleString()} €
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total des revenus
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-white" />
              </div>
              <ArrowDownRight className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1 text-red-600 dark:text-red-400">
              -{totalExpenses.toLocaleString()} €
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total des dépenses
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Vault className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1 text-blue-600 dark:text-blue-400">
              +{totalSavings.toLocaleString()} €
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total épargné
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className={`rounded-2xl border ${cardClasses}`}>
          <div className="p-6 border-b border-gray-300 dark:border-gray-600">
            <h2 className="text-xl font-poly font-bold">Transactions Récentes</h2>
          </div>
          
          <div className="divide-y divide-gray-300 dark:divide-gray-600">
            {filteredTransactions.map((transaction) => {
              const TransactionIcon = transaction.icon;
              return (
                <div key={transaction.id} className={`p-6 transition-all duration-200 hover:bg-stone-50 dark:hover:bg-gray-700/50`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        darkMode ? 'bg-gray-700' : 'bg-stone-100'
                      }`}>
                        <TransactionIcon className={`w-5 h-5 ${
                          transaction.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : transaction.type === 'vault'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-red-600 dark:text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-poly font-bold text-base">
                          {transaction.description}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {transaction.category}
                          </p>
                          <span className={`w-1 h-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`}></span>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {transaction.date} à {transaction.time}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-poly font-bold text-lg ${
                          transaction.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} €
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Complétée
                        </p>
                      </div>
                      <button className={`p-2 rounded-lg transition-all duration-200 ${
                        darkMode ? 'hover:bg-gray-600' : 'hover:bg-stone-100'
                      }`}>
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 border-t border-gray-300 dark:border-gray-600">
            <button className={`w-full py-3 text-center font-poly font-bold transition-all duration-200 rounded-xl ${
              darkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-stone-50'
            }`}>
              Charger plus de transactions
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
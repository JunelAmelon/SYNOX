import { useState } from 'react';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactionStats } from '../hooks/useTransactionStats';
import { 
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Vault,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3
} from 'lucide-react';
 
 
interface TransactionsProps {
  onLogout: () => void;
}

export default function Transactions({ onLogout }: TransactionsProps) {
  const { appliedTheme } = useTheme();
  const darkMode = appliedTheme === 'dark';
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [visibleCount, setVisibleCount] = useState(5);
  const { stats, transactions, loading, error, refreshStats } = useTransactionStats();

  const handleExport = () => {
    if (transactions.length === 0) {
      alert("Aucune transaction à exporter.");
      return;
    }

    const headers = ['Date', 'Description', 'Type', 'Montant', 'Statut'];
    const rows = transactions.map(t => [
      `"${new Date(t.createdAt).toLocaleString('fr-FR')}"`,
      `"${t.description || t.reference || 'N/A'}"`,
      `"${t.type}"`,
      t.montant,
      `"${t.status}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `synox_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  // Affichage du loading
  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Chargement des transactions...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <Layout onLogout={onLogout}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Erreur de chargement</h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {error}
              </p>
              <button
                onClick={refreshStats}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Utiliser les vraies données ou des valeurs par défaut
  const data = stats || {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalRefunds: 0,
    netBalance: 0,
    depositsCount: 0,
    withdrawalsCount: 0,
    refundsCount: 0,
    totalTransactions: 0,
    averageDeposit: 0,
    averageWithdrawal: 0,
    averageTransaction: 0,
    thisMonth: { deposits: 0, withdrawals: 0, count: 0 },
    lastMonth: { deposits: 0, withdrawals: 0, count: 0 },
    byPaymentMethod: {},
    byType: {},
    recentTransactions: [],
    monthlyTrend: []
  };

const cardClasses = darkMode 
  ? 'bg-gray-800 border-gray-700 text-white' 
  : 'bg-white border-gray-200 text-gray-900';

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
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button
                onClick={refreshStats}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  darkMode 
                    ? 'text-blue-400 hover:bg-gray-700 bg-gray-700/50' 
                    : 'text-blue-600 hover:bg-blue-50 bg-blue-50/50'
                }`}
                title="Actualiser les transactions"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button 
                onClick={handleExport}
                disabled={transactions.length === 0}
                className={`flex items-center px-6 py-3 rounded-xl font-poly font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  transactions.length > 0
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="w-5 h-5 mr-2" />
                Exporter
              </button>
            </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1 text-emerald-600 dark:text-emerald-400">
              +{data.totalDeposits.toLocaleString()} CFA
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total versements ({data.depositsCount})
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-white" />
              </div>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1 text-red-600 dark:text-red-400">
              -{data.totalWithdrawals.toLocaleString()} CFA
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total retraits ({data.withdrawalsCount})
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className={`w-5 h-5 ${data.netBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <h3 className={`font-poly font-bold text-2xl mb-1 ${
              data.netBalance >= 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {data.netBalance >= 0 ? '+' : ''}{data.netBalance.toLocaleString()} CFA
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Solde net
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1 text-purple-600 dark:text-purple-400">
              {data.totalTransactions}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total transactions
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className={`rounded-2xl border ${cardClasses}`}>
          <div className="p-6 border-b border-gray-300 dark:border-gray-600">
            <h2 className="text-xl font-poly font-bold">Transactions Récentes</h2>
          </div>
          
          <div className="divide-y divide-gray-300 dark:divide-gray-600">
              {transactions.length === 0 ? (
                <p className="p-6 text-center text-gray-500">Aucune transaction trouvée</p>
              ) : (
                transactions.slice(0, visibleCount).map((transaction) => {
                  const TransactionIcon = transaction.type === "income"
                    ? DollarSign
                    : transaction.type === "vault"
                    ? Vault
                    : ShoppingBag;

                  return (
                    <div key={transaction.id} className="p-6 hover:bg-stone-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            darkMode ? "bg-gray-700" : "bg-stone-100"
                          }`}>
                            <TransactionIcon className={`w-5 h-5 ${
                              transaction.type === "income"
                                ? "text-green-600 dark:text-green-400"
                                : transaction.type === "vault"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-red-600 dark:text-red-400"
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-poly font-bold text-base">{transaction.description || transaction.reference}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {transaction.type} — {transaction.montant} €
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          {visibleCount < transactions.length && (
            <div className="p-6 border-t border-gray-300 dark:border-gray-600">
              <button 
                onClick={() => setVisibleCount(prevCount => prevCount + 5)}
                className={`w-full py-3 text-center font-poly font-bold transition-all duration-200 rounded-xl ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-stone-50'
                }`}>
                Charger plus de transactions
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
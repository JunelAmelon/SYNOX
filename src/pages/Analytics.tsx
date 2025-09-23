import { useState } from 'react';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  DollarSign,
  RefreshCw,
  Vault,
  CreditCard
} from 'lucide-react';

interface AnalyticsProps {
  onLogout: () => void;
}

export default function Analytics({ onLogout }: AnalyticsProps) {
  const { appliedTheme } = useTheme();
  const darkMode = appliedTheme === 'dark';
  const [timeRange, setTimeRange] = useState('6months');
  const { analytics, loading, error, refreshAnalytics } = useAnalytics();


  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700 text-white' 
    : 'bg-white border-gray-200 text-gray-900';

  // Affichage du loading
  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Calcul des statistiques en cours...
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
                onClick={refreshAnalytics}
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
  const data = analytics || {
    totalSaved: 0,
    totalVaults: 0,
    activeVaults: 0,
    completedVaults: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransactions: 0,
    averageTransactionAmount: 0,
    monthlyGrowth: 0,
    averageContribution: 0,
    completionRate: 0,
    bestPerformingVault: 'Aucun',
    vaultsByType: {},
    transactionsByType: {},
    monthlyData: []
  };

  const monthlyData = data.monthlyData || [];
  const totalVaults = Object.values(data.vaultsByType).reduce((sum, count) => sum + count, 0);
  const categoryBreakdown = Object.entries(data.vaultsByType).map(([key, count]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1),
    amount: count, // C'est le nombre de coffres, pas un montant en euros
    percentage: totalVaults > 0 ? (count / totalVaults) * 100 : 0,
    color: 'from-blue-500 to-blue-600' // Logique de couleur à améliorer plus tard
  }));

  return (
    <Layout onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-poly font-bold mb-2">
                Analyses & Statistiques
              </h1>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Suivez vos performances d'épargne et optimisez vos stratégies
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshAnalytics}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  darkMode 
                    ? 'text-blue-400 hover:bg-gray-700 bg-gray-700/50' 
                    : 'text-blue-600 hover:bg-blue-50 bg-blue-50/50'
                }`}
                title="Actualiser les statistiques"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`px-4 py-2 rounded-xl border transition-colors mt-4 sm:mt-0 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-stone-200 text-gray-900'
                }`}
              >
                <option value="1month">1 mois</option>
                <option value="3months">3 mois</option>
                <option value="6months">6 mois</option>
                <option value="1year">1 an</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {data.totalSaved.toLocaleString()} CFA
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total épargné
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {data.monthlyGrowth > 0 ? '+' : ''}{data.monthlyGrowth.toFixed(1)}%
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Croissance mensuelle
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {data.averageContribution.toLocaleString()} CFA
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Contribution moyenne
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {data.completionRate.toFixed(0)}%
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Taux de réalisation
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Vault className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {data.totalVaults}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total coffres
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-lg mb-1">
              {data.totalTransactions}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total transactions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Performance Chart */}
          <div className={`rounded-2xl p-6 border ${cardClasses}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-poly font-bold">Performance Mensuelle</h2>
              <BarChart3 className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            
            <div className="space-y-4">
              {monthlyData.length > 0 ? (
                monthlyData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-poly font-semibold w-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.month}
                      </span>
                      <div className="flex-1 w-32">
                        <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500"
                            style={{ width: `${item.deposits > 0 ? (item.deposits / (item.deposits + item.withdrawals)) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-poly font-bold text-sm text-green-500">
                        +{item.deposits.toLocaleString()} CFA
                      </p>
                      <p className={`text-xs ${item.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        Solde: {item.balance.toLocaleString()} CFA
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-center text-gray-500'>Données mensuelles non disponibles.</p>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className={`rounded-2xl p-6 border ${cardClasses}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-poly font-bold">Répartition par Catégorie</h2>
              <PieChart className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            
            <div className="space-y-4">
              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${category.color}`}></div>
                      <span className={`font-poly font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {category.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-poly font-bold text-sm">
                        {category.amount} coffre(s)
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {category.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-center text-gray-500'>Aucune répartition par catégorie disponible.</p>
              )}
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className={`rounded-2xl p-6 border ${cardClasses}`}>
          <h2 className="text-xl font-poly font-bold mb-6">Insights & Recommandations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200'}`}>
              <div className="flex items-center mb-3">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                <h3 className="font-poly font-bold text-emerald-700 dark:text-emerald-300">Excellente Performance</h3>
              </div>
              <p className={`text-sm ${darkMode ? 'text-emerald-200' : 'text-emerald-700'}`}>
                Votre coffre voyage dépasse les objectifs de 25%. Continuez sur cette lancée !
              </p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center mb-3">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                <h3 className="font-poly font-bold text-amber-700 dark:text-amber-300">Optimisation Possible</h3>
              </div>
              <p className={`text-sm ${darkMode ? 'text-amber-200' : 'text-amber-700'}`}>
                Augmentez votre contribution auto de 50€/mois pour atteindre l'objectif plus rapidement.
              </p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="font-poly font-bold text-blue-700 dark:text-blue-300">Planification</h3>
              </div>
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                Créez un nouveau coffre "Vacances d'été" pour préparer la saison prochaine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Percent,
  Clock
} from 'lucide-react';

interface AnalyticsProps {
  onLogout: () => void;
}

export default function Analytics({ onLogout }: AnalyticsProps) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [timeRange, setTimeRange] = useState('6months');

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

  const analyticsData = {
    totalSaved: 30200,
    monthlyGrowth: 12.5,
    averageContribution: 1150,
    completionRate: 67,
    bestPerformingVault: 'Coffre Voyage Europe',
    savingsVelocity: 8.3
  };

  const monthlyData = [
    { month: 'Jan', saved: 800, target: 1000 },
    { month: 'Fév', saved: 950, target: 1000 },
    { month: 'Mar', saved: 1200, target: 1200 },
    { month: 'Avr', saved: 1100, target: 1200 },
    { month: 'Mai', saved: 1350, target: 1300 },
    { month: 'Jun', saved: 1400, target: 1300 },
  ];

  const categoryBreakdown = [
    { category: 'Voyage', amount: 8500, percentage: 28, color: 'from-blue-500 to-blue-600' },
    { category: 'Immobilier', amount: 15000, percentage: 50, color: 'from-green-500 to-green-600' },
    { category: 'Véhicule', amount: 1200, percentage: 4, color: 'from-purple-500 to-purple-600' },
    { category: 'Urgence', amount: 5500, percentage: 18, color: 'from-emerald-500 to-emerald-600' },
  ];

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
              {analyticsData.totalSaved.toLocaleString()} €
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
              +{analyticsData.monthlyGrowth}%
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
              {analyticsData.averageContribution} €
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
              {analyticsData.completionRate}%
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Taux de réalisation
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {analyticsData.savingsVelocity}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Vélocité d'épargne
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-lg mb-1">
              8 mois
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Temps moyen objectif
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
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-poly font-semibold w-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {data.month}
                    </span>
                    <div className="flex-1 w-32">
                      <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                          style={{ width: `${(data.saved / data.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-poly font-bold text-sm">
                      {data.saved}€ / {data.target}€
                    </p>
                    <p className={`text-xs ${
                      data.saved >= data.target 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {Math.round((data.saved / data.target) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className={`rounded-2xl p-6 border ${cardClasses}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-poly font-bold">Répartition par Catégorie</h2>
              <PieChart className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            
            <div className="space-y-4">
              {categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${category.color}`}></div>
                    <span className={`font-poly font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-poly font-bold text-sm">
                      {category.amount.toLocaleString()}€
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {category.percentage}%
                    </p>
                  </div>
                </div>
              ))}
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
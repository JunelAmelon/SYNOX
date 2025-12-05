import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  GraduationCap,
  Plus,
  BookOpen,
  Clock,
  Star,
  Play,
  CheckCircle,
  Search,
  MoreHorizontal,
  Award,
  TrendingUp,
  Video,
  Lock,
  AlertCircle,
  X
} from 'lucide-react';

interface FormationProps {
  onLogout: () => void;
}

export default function Formation({ onLogout }: FormationProps) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFormation, setSelectedFormation] = useState<number | null>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

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

  const formations = [
    {
      id: 1,
      title: 'Gestion Financière Personnelle',
      description: 'Apprenez les bases de la gestion financière et de l\'épargne intelligente',
      category: 'Finance',
      level: 'Débutant',
      duration: '4h 30min',
      lessons: 12,
      progress: 0,
      rating: 4.8,
      students: 1250,
      instructor: 'ARYWO',
      price: '',
      status: 'not_started',
      thumbnail: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['Épargne', 'Budget', 'Investissement'],
      lastAccessed: null,
      available: false,
      comingSoon: true
    },
    {
      id: 2,
      title: 'Investissement pour Débutants',
      description: 'Découvrez les différents types d\'investissements et comment commencer',
      category: 'Investissement',
      level: 'Débutant',
      duration: '6h 15min',
      lessons: 18,
      progress: 0,
      rating: 4.9,
      students: 890,
      instructor: 'ARYWO',
      price: '',
      status: 'not_started',
      thumbnail: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['Actions', 'Obligations', 'ETF'],
      lastAccessed: null,
      available: false,
      comingSoon: true
    },
    {
      id: 3,
      title: 'Planification de Retraite',
      description: 'Stratégies avancées pour préparer votre retraite efficacement',
      category: 'Retraite',
      level: 'Avancé',
      duration: '8h 45min',
      lessons: 24,
      progress: 0,
      rating: 4.7,
      students: 567,
      instructor: 'ARYWO',
      price: '',
      status: 'not_started',
      thumbnail: 'https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['Retraite', 'PER', 'Assurance vie'],
      lastAccessed: null,
      available: false,
      comingSoon: true
    },
    {
      id: 4,
      title: 'Cryptomonnaies et Blockchain',
      description: 'Comprendre les cryptomonnaies et la technologie blockchain',
      category: 'Crypto',
      level: 'Intermédiaire',
      duration: '5h 20min',
      lessons: 15,
      progress: 0,
      rating: 4.6,
      students: 723,
      instructor: 'ARYWO',
      price: '',
      status: 'not_started',
      thumbnail: 'https://images.pexels.com/photos/6801647/pexels-photo-6801647.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['Bitcoin', 'Ethereum', 'DeFi'],
      lastAccessed: null,
      available: false,
      comingSoon: true
    },
    {
      id: 5,
      title: 'Immobilier Locatif',
      description: 'Guide complet pour investir dans l\'immobilier locatif',
      category: 'Immobilier',
      level: 'Intermédiaire',
      duration: '7h 10min',
      lessons: 20,
      progress: 0,
      rating: 4.8,
      students: 445,
      instructor: 'ARYWO',
      price: '',
      status: 'not_started',
      thumbnail: 'https://images.pexels.com/photos/6801872/pexels-photo-6801872.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['Location', 'Rentabilité', 'Fiscalité'],
      lastAccessed: null,
      available: false,
      comingSoon: true
    },
    {
      id: 6,
      title: 'Analyse Technique des Marchés',
      description: 'Maîtrisez l\'analyse technique pour optimiser vos investissements',
      category: 'Trading',
      level: 'Avancé',
      duration: '9h 30min',
      lessons: 28,
      progress: 0,
      rating: 4.9,
      students: 334,
      instructor: 'ARYWO',
      price: '',
      status: 'not_started',
      thumbnail: 'https://images.pexels.com/photos/6801873/pexels-photo-6801873.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['Graphiques', 'Indicateurs', 'Stratégies'],
      lastAccessed: null,
      available: false,
      comingSoon: true
    }
  ];

  const categories = ['all', 'Finance', 'Investissement', 'Retraite', 'Crypto', 'Immobilier', 'Trading'];
  const statuses = ['all', 'not_started', 'in_progress', 'completed'];

  const filteredFormations = formations.filter(formation => {
    const categoryMatch = filterCategory === 'all' || formation.category === filterCategory;
    const statusMatch = filterStatus === 'all' || formation.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const handleFormationClick = (formation: any) => {
    if (!formation.available) {
      setShowComingSoonModal(true);
      setSelectedFormation(formation.id);
    } else {
      // Ici vous pouvez naviguer vers le contenu de la formation
      console.log('Ouvrir la formation:', formation.title);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'not_started':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      case 'not_started':
        return 'Non commencé';
      default:
        return 'Inconnu';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Intermédiaire':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Avancé':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Stats
  const totalFormations = formations.length;
  const completedFormations = 0;
  const inProgressFormations = 0;
  const totalHours = formations.reduce((acc, f) => {
    const hours = parseFloat(f.duration.split('h')[0]);
    return acc + hours;
  }, 0);

  return (
    <Layout onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-poly font-bold mb-2">
                Centre de Formation
              </h1>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Développez vos compétences financières avec nos formations expertes
              </p>
            </div>

          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                className={`px-4 py-2 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-stone-200 text-gray-900'
              }`}
            >
              <option value="all">Toutes les catégories</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-stone-200 text-gray-900'
              }`}
            >
              <option value="all">Tous les statuts</option>
              <option value="not_started">Non commencé</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">{totalFormations}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Formations disponibles
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">{completedFormations}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Formations terminées
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">{inProgressFormations}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              En cours
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">{totalHours.toFixed(0)}h</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Temps total
            </p>
          </div>
        </div>

        {/* Formations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredFormations.map((formation) => (
            <div 
              key={formation.id} 
              className={`rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden cursor-pointer ${cardClasses} ${
                !formation.available ? 'opacity-75' : ''
              }`}
              onClick={() => handleFormationClick(formation)}
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={formation.thumbnail} 
                  alt={formation.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                {!formation.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-white mx-auto mb-2" />
                      <span className="text-white font-bold text-sm">À VENIR</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-poly font-semibold ${getLevelColor(formation.level)}`}>
                    {formation.level}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-poly font-semibold ${getStatusColor(formation.status)}`}>
                    {getStatusText(formation.status)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-poly font-bold text-lg mb-2 line-clamp-2">
                      {formation.title}
                    </h3>
                    <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formation.description}
                    </p>
                  </div>
                  <button className={`p-2 rounded-lg transition-all duration-200 ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-stone-100'
                  }`}>
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{formation.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Video className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{formation.lessons} leçons</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className={`font-poly font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formation.rating}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formation.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className={`px-2 py-1 rounded-lg text-xs font-poly font-semibold ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-stone-100 text-gray-700'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-600">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Par {formation.instructor}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-poly font-bold cursor-not-allowed">
                      <Lock className="w-4 h-4 mr-2" />
                      À venir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFormations.length === 0 && (
          <div className={`text-center py-12 rounded-2xl border ${cardClasses}`}>
            <GraduationCap className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className="font-poly font-bold text-xl mb-2">Aucune formation trouvée</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Aucune formation ne correspond à vos critères de recherche
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200">
              Parcourir toutes les formations
            </button>
          </div>
        )}
      </div>

      {/* Modal "À venir" */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-8 max-w-md w-full mx-4 ${cardClasses}`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-poly font-bold mb-4">
                Formation à venir !
              </h3>
              
              <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Cette formation est actuellement en développement. Elle sera bientôt disponible avec du contenu exclusif et des exercices pratiques.
              </p>
              
              <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
                <p className={`text-sm font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  🚀 Restez connecté pour être notifié dès sa sortie !
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowComingSoonModal(false)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200"
                >
                  Compris !
                </button>
                <button 
                  onClick={() => setShowComingSoonModal(false)}
                  className={`flex-1 px-6 py-3 border rounded-xl font-poly font-semibold transition-all duration-200 ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Me notifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
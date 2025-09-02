import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Bell, CheckCircle, AlertTriangle, Info, Trash2, BookMarked as MarkAsRead, Filter, Settings, Clock, Target, Vault, TrendingUp, Users, Shield } from 'lucide-react';

interface NotificationsProps {
  onLogout: () => void;
}

export default function Notifications({ onLogout }: NotificationsProps) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [filterType, setFilterType] = useState('all');

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

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Objectif atteint !',
      message: 'Félicitations ! Votre coffre "Formation Tech" a atteint son objectif de 3 500€.',
      timestamp: '2025-01-15T10:30:00',
      read: false,
      icon: Target,
      category: 'achievement'
    },
    {
      id: 2,
      type: 'info',
      title: 'Contribution mensuelle',
      message: 'Votre contribution de 250€ pour le coffre "Voyage Europe" a été effectuée avec succès.',
      timestamp: '2025-01-14T09:00:00',
      read: false,
      icon: Vault,
      category: 'transaction'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Objectif en retard',
      message: 'Votre coffre "Auto Premium" est en retard sur l\'objectif mensuel. Considérez augmenter votre contribution.',
      timestamp: '2025-01-13T16:45:00',
      read: true,
      icon: AlertTriangle,
      category: 'alert'
    },
    {
      id: 4,
      type: 'info',
      title: 'Nouveau tiers de confiance',
      message: 'Sophie Leroy a accepté votre invitation et peut maintenant voir vos coffres d\'épargne.',
      timestamp: '2025-01-12T14:20:00',
      read: true,
      icon: Users,
      category: 'security'
    },
    {
      id: 5,
      type: 'success',
      title: 'Performance exceptionnelle',
      message: 'Votre épargne a augmenté de 15% ce mois ! Vous êtes sur la bonne voie.',
      timestamp: '2025-01-11T11:15:00',
      read: true,
      icon: TrendingUp,
      category: 'achievement'
    },
    {
      id: 6,
      type: 'info',
      title: 'Rappel de sécurité',
      message: 'Il est recommandé de changer votre mot de passe tous les 3 mois pour une sécurité optimale.',
      timestamp: '2025-01-10T08:00:00',
      read: true,
      icon: Shield,
      category: 'security'
    },
    {
      id: 7,
      type: 'warning',
      title: 'Coffre bientôt verrouillé',
      message: 'Votre coffre "Sécurité" sera automatiquement verrouillé dans 7 jours selon vos paramètres.',
      timestamp: '2025-01-09T12:30:00',
      read: true,
      icon: Clock,
      category: 'alert'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notification.read;
    return notification.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return darkMode 
          ? 'bg-emerald-900/20 border-emerald-800 text-emerald-300' 
          : 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'warning':
        return darkMode 
          ? 'bg-amber-900/20 border-amber-800 text-amber-300' 
          : 'bg-amber-50 border-amber-200 text-amber-700';
      case 'info':
        return darkMode 
          ? 'bg-blue-900/20 border-blue-800 text-blue-300' 
          : 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return darkMode 
          ? 'bg-gray-800 border-gray-700 text-gray-300' 
          : 'bg-white border-stone-200 text-gray-700';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-poly font-bold mb-2">
                Notifications
              </h1>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Restez informé de l'activité de vos coffres d'épargne
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-stone-100 text-gray-600 hover:bg-stone-200'
              }`}>
                <MarkAsRead className="w-4 h-4 mr-2" />
                Tout marquer lu
              </button>
              <button className={`p-2 rounded-xl transition-all duration-200 ${
                darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-stone-100 text-gray-600 hover:bg-stone-200'
              }`}>
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-stone-200 text-gray-900'
              }`}
            >
              <option value="all">Toutes les notifications</option>
              <option value="unread">Non lues ({unreadCount})</option>
              <option value="success">Succès</option>
              <option value="warning">Alertes</option>
              <option value="info">Informations</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">{notifications.length}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total notifications
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">{unreadCount}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Non lues
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {notifications.filter(n => n.type === 'success').length}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Succès
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {notifications.filter(n => n.type === 'warning').length}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Alertes
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const NotificationIcon = notification.icon;
            return (
              <div 
                key={notification.id} 
                className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                  notification.read 
                    ? cardClasses 
                    : `${getNotificationColor(notification.type)} border-2`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      darkMode ? 'bg-gray-700' : 'bg-stone-100'
                    }`}>
                      <NotificationIcon className={`w-6 h-6 ${getIconColor(notification.type)}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-poly font-bold text-lg">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm mb-3 leading-relaxed ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-poly font-semibold ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-stone-100 text-gray-600'
                        }`}>
                          {notification.category === 'achievement' && 'Réussite'}
                          {notification.category === 'transaction' && 'Transaction'}
                          {notification.category === 'alert' && 'Alerte'}
                          {notification.category === 'security' && 'Sécurité'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button className={`p-2 rounded-lg transition-all duration-200 ${
                        darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-stone-100 text-gray-500'
                      }`}>
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button className={`p-2 rounded-lg transition-all duration-200 ${
                      darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-stone-100 text-gray-500'
                    }`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredNotifications.length === 0 && (
          <div className={`text-center py-12 rounded-2xl border ${cardClasses}`}>
            <Bell className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className="font-poly font-bold text-xl mb-2">Aucune notification</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filterType === 'all' 
                ? 'Vous n\'avez aucune notification pour le moment'
                : `Aucune notification ${filterType === 'unread' ? 'non lue' : filterType} trouvée`
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
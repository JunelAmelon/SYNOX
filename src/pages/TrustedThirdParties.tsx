import React, { useState } from 'react';
import Layout from '../components/Layout';
import TrustedPartyModal from '../components/TrustedPartyModal';
import { useTrustedThirdParties, CreateTrustedPartyData, UpdateTrustedPartyData, TrustedThirdParty } from '../hooks/useTrustedThirdParties';
import { db, auth } from "../firebase/firebase";
import { useAuth } from '../hooks/useAuth';
import { onAuthStateChanged } from "firebase/auth";
import { 
  Users,
  Plus,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  Edit,
  Trash2,
  UserX,
  UserCheck
} from 'lucide-react';

interface TrustedThirdPartiesProps {
  onLogout: () => void;
}

export default function TrustedThirdParties({ onLogout }: TrustedThirdPartiesProps) {
  const {
    createTrustedParty,
    updateTrustedParty,
    deleteTrustedParty,
    revokeAccess,
    reactivateParty,
    getStats,
    filterParties
  } = useTrustedThirdParties();

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingParty, setEditingParty] = useState<TrustedThirdParty | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Listen for dark mode changes
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const currentUser = auth.currentUser;

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700 text-white' 
    : 'bg-white border-gray-200 text-gray-900';

  const stats = getStats();
  const filteredParties = filterParties(filterStatus, undefined, searchTerm)
  .filter(party => party.userId === currentUser?.uid);



  const handleCreateParty = async (data: CreateTrustedPartyData) => {
    await createTrustedParty(data);
    setShowModal(false);
  };

  const handleUpdateParty = async (data: UpdateTrustedPartyData) => {
    if (editingParty) {
      await updateTrustedParty(editingParty.id, data);
      setEditingParty(null);
      setShowModal(false);
    }
  };

  const handleEditParty = (party: TrustedThirdParty) => {
    setEditingParty(party);
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteParty = async (partyId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tiers de confiance ?')) {
      await deleteTrustedParty(partyId);
      setOpenMenuId(null);
    }
  };

  const handleRevokeAccess = async (partyId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir révoquer l\'accès de ce tiers de confiance ?')) {
      await revokeAccess(partyId);
      setOpenMenuId(null);
    }
  };

  const handleReactivateParty = async (partyId: string) => {
    await reactivateParty(partyId);
    setOpenMenuId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'inactive':
        return 'Inactif';
      default:
        return 'Inconnu';
    }
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-poly font-bold mb-2">
                Tiers de Confiance
              </h1>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Gérez les personnes autorisées à accéder à vos coffres d'épargne
              </p>
            </div>
            <button 
              onClick={() => {
                setEditingParty(null);
                setShowModal(true);
              }}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mt-4 sm:mt-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un Tiers
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une personne..."
                className={`px-4 py-2 rounded-xl border transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
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
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">{stats.totalParties}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total des tiers
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {stats.activeParties}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tiers actifs
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {stats.pendingParties}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              En attente
            </p>
          </div>

          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="font-poly font-bold text-2xl mb-1">
              {stats.emergencyAccessParties}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Accès d'urgence
            </p>
          </div>
        </div>

        {/* Trusted Parties List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredParties.map((party) => (
            <div key={party.id} className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${cardClasses}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-poly font-bold text-sm">{party.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-poly font-bold text-lg">{party.name}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {party.relationship}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-poly font-semibold flex items-center space-x-1 ${getStatusColor(party.status)}`}>
                    {getStatusIcon(party.status)}
                    <span>{getStatusText(party.status)}</span>
                  </span>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === party.id ? null : party.id)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-stone-100'
                      }`}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {/* Menu déroulant */}
                    {openMenuId === party.id && (
                      <div className={`absolute right-0 top-12 w-48 rounded-xl shadow-2xl border-2 z-50 ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="p-2">
                          <button
                            onClick={() => handleEditParty(party)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                              darkMode 
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <Edit className="w-4 h-4 mr-3" />
                            Modifier
                          </button>
                          
                          {party.status === 'active' ? (
                            <button
                              onClick={() => handleRevokeAccess(party.id)}
                              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                                darkMode 
                                  ? 'text-orange-400 hover:bg-orange-900/20 hover:text-orange-300' 
                                  : 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
                              }`}
                            >
                              <UserX className="w-4 h-4 mr-3" />
                              Révoquer l'accès
                            </button>
                          ) : party.status === 'inactive' || party.status === 'revoked' ? (
                            <button
                              onClick={() => handleReactivateParty(party.id)}
                              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                                darkMode 
                                  ? 'text-green-400 hover:bg-green-900/20 hover:text-green-300' 
                                  : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                              }`}
                            >
                              <UserCheck className="w-4 h-4 mr-3" />
                              Réactiver
                            </button>
                          ) : null}
                          
                          <div className={`my-2 h-px ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                          
                          <button
                            onClick={() => handleDeleteParty(party.id)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                              darkMode 
                                ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                            }`}
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3">
                  <Mail className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {party.email}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {party.phone}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ajouté le {new Date(party.addedDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {party.lastAccess && (
                  <div className="flex items-center space-x-3">
                    <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Dernier accès: {new Date(party.lastAccess).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                <h4 className="font-poly font-bold text-sm mb-2">Permissions accordées:</h4>
                <div className="flex flex-wrap gap-2">
                  {party.permissions.map((permission, index) => (
                    <span key={index} className={`px-2 py-1 rounded-lg text-xs font-poly font-semibold ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-stone-100 text-gray-700'
                    }`}>
                      {permission === 'view_vaults' && 'Voir les coffres'}
                      {permission === 'manage_vaults' && 'Gérer les coffres'}
                      {permission === 'emergency_access' && 'Accès d\'urgence'}
                      {permission === 'view_analytics' && 'Voir les analyses'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredParties.length === 0 && (
          <div className={`text-center py-12 rounded-2xl border ${cardClasses}`}>
            <Users className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className="font-poly font-bold text-xl mb-2">Aucun tiers de confiance trouvé</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              {filterStatus === 'all' 
                ? 'Ajoutez des personnes de confiance pour partager l\'accès à vos coffres'
                : `Aucun tiers ${filterStatus === 'active' ? 'actif' : filterStatus === 'pending' ? 'en attente' : 'inactif'} trouvé`
              }
            </p>
            <button 
              onClick={() => {
                setEditingParty(null);
                setShowModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200"
            >
              Ajouter un tiers de confiance
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className={`mt-8 p-6 rounded-2xl border-2 ${
          darkMode 
            ? 'bg-amber-900/20 border-amber-800' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-poly font-bold text-amber-700 dark:text-amber-300 mb-2">
                Important - Sécurité des Tiers de Confiance
              </h3>
              <p className={`text-sm ${darkMode ? 'text-amber-200' : 'text-amber-700'} leading-relaxed`}>
                Les tiers de confiance peuvent accéder à vos informations financières selon les permissions accordées. 
                Assurez-vous de ne donner accès qu'aux personnes en qui vous avez une confiance absolue. 
                Vous pouvez révoquer l'accès à tout moment depuis cette page.
              </p>
            </div>
          </div>
        </div>

        {/* Modal */}
        <TrustedPartyModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingParty(null);
          }}
          onSubmit={async (data) => {
            if (editingParty) {
              await handleUpdateParty(data as UpdateTrustedPartyData);
            } else {
              await handleCreateParty(data as CreateTrustedPartyData);
            }
          }}
          darkMode={darkMode}
          editingParty={editingParty}
        />
      </div>
    </Layout>
  );
}
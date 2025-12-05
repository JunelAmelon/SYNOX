import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CreateVaultModal from '../components/CreateVaultModal';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import EditVaultModal from '../components/EditVaultModal';
import { useVaults, CreateVaultData } from '../hooks/useVaults';
import { useToastContext } from '../contexts/ToastContext';
import { useWithdrawalApproval } from '../hooks/useWithdrawalApproval';
import { useTrustedThirdParties } from '../hooks/useTrustedThirdParties';
import { db } from "../firebase/firebase";
import { useAuth } from '../hooks/useAuth';
import { useKKiaPay } from 'kkiapay-react';
import { collection, onSnapshot, query, where, getDoc, addDoc, increment, doc, updateDoc } from "firebase/firestore";
import {
Plus,
Search,
Lock,
Unlock,
Calendar,
DollarSign,
Target,
Car,
Plane,
Home,
GraduationCap,
Heart,
ShoppingBag,
Smartphone,
Vault,
Shield,
ChevronLeft,
ChevronRight,
Edit,
Trash2, 
MoreHorizontal,
ArrowDownLeft
} from 'lucide-react';

// Interface pour Vault
interface Vault {
  id: string;
  name: string;
  type: string;
  current: number;
  target?: number;
  isLocked: boolean;
  unlockDate?: string;
  createdAt: string;
  updatedAt?: string;
  isGoalBased?: boolean; // Indique si c'est un coffre avec objectif précis (true) ou épargne libre (false)
}

interface VaultsProps {
onLogout: () => void;
}

export default function Vaults({ onLogout }: VaultsProps) {
const { currentUser, loading: authLoading } = useAuth();
const [darkMode, setDarkMode] = useState(() => {
return document.documentElement.classList.contains('dark');
});

const [vaults, setVaults] = useState<Vault[]>([]);
const [showCreateModal, setShowCreateModal] = useState(false);
const [showDepositModal, setShowDepositModal] = useState(false);
const [showWithdrawModal, setShowWithdrawModal] = useState(false);
const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
const [openMenuId, setOpenMenuId] = useState<string | null>(null);
const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'locked' | 'completed'>('all');
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState('');
const [showEditModal, setShowEditModal] = useState(false);

const {
loading,
error,
createVault,
deleteVault,
lockVault,
unlockVault
} = useVaults();

const { success, warning, error: showError } = useToastContext();
const { createWithdrawalRequest } = useWithdrawalApproval();
const { trustedParties } = useTrustedThirdParties();
const vaultsPerPage = 3;

// Fonction pour vérifier si l'approbation des tiers est nécessaire
const checkIfApprovalNeeded = (vaultData: any, currentAmount: number): boolean => {
  // Approbation requise si :
  // 1. La date de déblocage n'est pas atteinte (même si le coffre n'est pas verrouillé)
  // 2. OU l'objectif n'est pas encore atteint (pour les coffres avec objectif)
  
  // Vérifier la date de déblocage
  if (vaultData.unlockDate) {
    const unlockDate = new Date(vaultData.unlockDate);
    const now = new Date();
    if (now < unlockDate) {
      console.log('📅 [ApprovalCheck] Date de déblocage non atteinte:', unlockDate.toLocaleDateString());
      return true;
    }
  }
  
  // Vérifier l'objectif pour les coffres à objectif précis
  if (vaultData.isGoalBased && vaultData.target && currentAmount < vaultData.target) {
    console.log('🎯 [ApprovalCheck] Objectif non atteint:', `${currentAmount}/${vaultData.target}`);
    return true;
  }
  
  console.log('✅ [ApprovalCheck] Retrait libre autorisé');
  return false;
};

// Listen for dark mode changes
React.useEffect(() => {
const observer = new MutationObserver(() => {
setDarkMode(document.documentElement.classList.contains('dark'));
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
return () => observer.disconnect();
}, []);

const filteredVaults = vaults.filter(v => {
const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
const matchesStatus = filterStatus === 'all'
|| (filterStatus === 'active' && !v.isLocked)
|| (filterStatus === 'locked' && v.isLocked)
|| (filterStatus === 'completed' && v.current >= (v.target ?? 0));
return matchesSearch && matchesStatus;
});

const handleCreateVault = async (vaultData: CreateVaultData) => {
try {
await createVault(vaultData);
setShowCreateModal(false);
} catch (err) {
console.error('Erreur lors de la création du coffre:', err);
}
};

const handleLockVault = async (vaultId: string) => {
try {
await lockVault(vaultId);
setOpenMenuId(null);
} catch (err) {
console.error('Erreur lors du verrouillage:', err);
}
};

const handleEditVault = (vault: Vault) => {
  setSelectedVault({
    id: vault.id,
    userId: vault.userId,
    name: vault.name,
    current: vault.current,
    target: vault.target,
    type: vault.type,
    status: vault.status,
    monthlyContrib: vault.monthlyContrib,
    daysLeft: vault.daysLeft,
    createdAt: vault.createdAt,
    updatedAt: vault.updatedAt,
    isGoalBased: vault.isGoalBased,
    isLocked: vault.isLocked,
    unlockDate: vault.unlockDate,
    description: vault.description,
    trustedThirdPartyId: vault.trustedThirdPartyId,
    lockConditions: vault.lockConditions,
  });
  setShowEditModal(true);
};

const handleDeleteVault = async (vaultId: string) => {
if (window.confirm('Êtes-vous sûr de vouloir supprimer ce coffre ?')) {
try {
await deleteVault(vaultId);
setOpenMenuId(null);
} catch (err) {
console.error('Erreur lors de la suppression:', err);
}
}
};

// Fonction de création de transaction
async function createTransaction({
amount,
paymentMethod,
status,
type,
userId,
vaultId,
reference,
reason
}: {
amount: number;
paymentMethod: string;
status: string;
type: string;
userId: string | undefined;
vaultId: string;
reference: string;
reason?: string;
}) {
try {
const transactionsCollection = collection(db, "transactions");
const docRef = await addDoc(transactionsCollection, {
createdAt: new Date(),
id_transaction: Math.floor(Math.random() * 1000000),
montant: amount,
paymentMethod,
status,
type,
userId,
vaultId,
reference,
...(reason && { reason })
});
console.log("Transaction enregistrée avec succès !!");
return docRef; // Retourner la référence du document
} catch (err) {
console.error("Erreur création transaction :", err);
throw err; // Propager l'erreur
}
}

// Fonction pour gérer les dépôts depuis le modal
const handleDepositFromModal = async (amount: number) => {
if (!selectedVault) return;

// Validation pour les coffres "Libre" : montant doit être exactement l'objectif
if (selectedVault.isGoalBased === false) {
  if (!selectedVault.target) {
    showError("Erreur : Objectif non défini pour ce coffre libre");
    return;
  }
  if (amount !== selectedVault.target) {
    showError(`Pour un coffre libre, vous devez déposer exactement ${selectedVault.target.toLocaleString()} CFA (montant objectif)`);
    return;
  }
  // Vérifier si le coffre est déjà rempli
  if (selectedVault.current >= selectedVault.target) {
    showError("Ce coffre libre est déjà rempli. Vous ne pouvez plus y déposer.");
    return;
  }
}

try {
// Débogage : Paramètres du widget
const widgetParams = {
    amount: amount,
    key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY,
    email: currentUser?.email || "client@example.com",
    phone: "97000000",
    data: JSON.stringify({ vaultId: selectedVault.id, montant: amount })
};

console.log('💳 [DEBUG] Ouverture du widget KkiaPay avec les paramètres:', widgetParams);
console.log('💳 [DEBUG] Montant:', amount);
console.log('💳 [DEBUG] Email utilisateur:', currentUser?.email);
console.log('💳 [DEBUG] Vérification de window.kkiapay:', typeof window.kkiapay);

// Utiliser l'API globale KkiaPay directement
if (window.kkiapay) {
    window.kkiapay.open(widgetParams);
    console.log('✅ [DEBUG] Widget ouvert via window.kkiapay.open()');
} else {
    console.error('❌ [DEBUG] window.kkiapay non disponible');
    // Fallback vers le hook
    openKkiapayWidget(widgetParams);
    console.log('✅ [DEBUG] Fallback vers openKkiapayWidget');
}

setOpenMenuId(null);
success('Redirection vers le paiement...');
} catch (err) {
console.error("Erreur lors du dépôt :", err);
showError("Impossible d'effectuer le dépôt. Réessayez plus tard.");
}
};

// Fonction pour gérer les retraits depuis le modal
const handleWithdrawFromModal = async (amount: number, reason: string) => {
if (!selectedVault || !currentUser) return;

// Validation pour les coffres "Libre" : montant doit être exactement le solde actuel
if (selectedVault.isGoalBased === false) {
  if (amount !== selectedVault.current) {
    showError(`Pour un coffre libre, vous devez retirer exactement ${selectedVault.current.toLocaleString()} CFA (montant déposé)`);
    return;
  }
}

console.log('🚀 [RETRAIT] ========== DÉBUT DU PROCESSUS DE RETRAIT ==========');
console.log('💰 [RETRAIT] Montant demandé:', amount, 'CFA');
console.log('📝 [RETRAIT] Raison:', reason);
console.log('🏦 [RETRAIT] Coffre sélectionné:', selectedVault.name, '(ID:', selectedVault.id, ')');
console.log('👤 [RETRAIT] Utilisateur:', currentUser.email);

try {
console.log('📋 [RETRAIT] Récupération des données du coffre...');
const vaultRef = doc(db, "vaults", selectedVault.id);
const vaultSnap = await getDoc(vaultRef);

if (!vaultSnap.exists()) {
console.error('❌ [RETRAIT] Coffre introuvable dans la base de données');
showError("Coffre introuvable !");
return;
}

const vaultData = vaultSnap.data();
let current = vaultData.current;
if (typeof current !== "number") current = 0;

console.log('💳 [RETRAIT] Solde actuel du coffre:', current, 'CFA');
console.log('🎯 [RETRAIT] Objectif du coffre:', vaultData.target || 'Aucun', 'CFA');
console.log('📊 [RETRAIT] Type de coffre:', vaultData.isGoalBased ? 'Objectif précis' : 'Épargne libre');
console.log('🔒 [RETRAIT] Statut verrouillage:', vaultData.isLocked ? 'Verrouillé' : 'Déverrouillé');

if (amount > current) {
console.error('❌ [RETRAIT] Montant supérieur au solde disponible');
console.error('❌ [RETRAIT] Demandé:', amount, 'CFA | Disponible:', current, 'CFA');
showError("Montant supérieur au solde disponible !");
return;
}

console.log('✅ [RETRAIT] Vérification du solde : OK');
console.log('🔍 [RETRAIT] Analyse des conditions de retrait...');

// Vérifier si l'approbation des tiers est nécessaire
const needsApproval = checkIfApprovalNeeded(vaultData, current);
console.log('🔐 [RETRAIT] Résultat analyse approbation:', needsApproval ? 'APPROBATION REQUISE' : 'RETRAIT LIBRE');

if (needsApproval) {
  // CAS 1: APPROBATION REQUISE - Demande aux tiers de confiance
  console.log('🔐 [RETRAIT] ========== CAS 1: APPROBATION REQUISE ==========');
  console.log('📧 [RETRAIT] Recherche des tiers de confiance actifs...');
  
  // Récupérer les tiers de confiance actifs avec permission d'approbation
  const activeTrustedParties = trustedParties.filter(tp => 
    tp.status === 'active' && 
    tp.permissions.includes('approve_withdrawals')
  );

  console.log('👥 [RETRAIT] Tiers de confiance trouvés:', activeTrustedParties.length);
  console.log('👥 [RETRAIT] Détails des tiers:', activeTrustedParties.map(tp => ({
    name: tp.name,
    email: tp.email,
    status: tp.status
  })));

  if (activeTrustedParties.length < 2) {
    console.error('❌ [RETRAIT] Pas assez de tiers de confiance actifs');
    console.error('❌ [RETRAIT] Requis: 2 | Disponibles:', activeTrustedParties.length);
    showError(`Vous devez avoir au moins 2 tiers de confiance actifs avec permission d'approbation pour effectuer un retrait. Actuellement: ${activeTrustedParties.length} tiers valides sur ${trustedParties.length} total.`);
    return;
  }

  // Prendre les 2 premiers tiers de confiance
  const selectedTrustedParties = activeTrustedParties.slice(0, 2).map(tp => ({
    trustedPartyId: tp.id,
    trustedPartyName: tp.name,
    trustedPartyEmail: tp.email,
    accessCode: ''
  }));

  console.log('✅ [RETRAIT] Tiers sélectionnés pour approbation:', selectedTrustedParties.map(tp => tp.trustedPartyName));
  console.log('📤 [RETRAIT] Création de la demande de retrait...');

  // Créer une demande de retrait avec approbation
  const requestId = await createWithdrawalRequest(
    currentUser.uid,
    selectedVault.id,
    selectedVault.name,
    amount,
    reason,
    selectedTrustedParties
  );

  console.log('✅ [RETRAIT] Demande créée avec ID:', requestId);
  console.log('💾 [RETRAIT] Création de la transaction en attente...');

  // Créer une transaction de retrait en attente
  const transactionRef = await createTransaction({
    amount: -amount,
    paymentMethod: "En attente d'approbation",
    status: "pending",
    type: "Retrait",
    userId: currentUser.uid,
    vaultId: selectedVault.id,
    reference: `Demande-${requestId}`,
    reason: reason
  });

  console.log('✅ [RETRAIT] Transaction créée avec ID:', transactionRef.id);
  console.log('🔗 [RETRAIT] Liaison demande-transaction...');

  // Enregistrer l'ID de la transaction dans la demande de retrait
  await updateDoc(doc(db, 'withdrawalRequests', requestId), {
    transactionId: transactionRef.id
  });

  console.log('✅ [RETRAIT] Processus d\'approbation terminé avec succès');
  console.log('📧 [RETRAIT] Les tiers de confiance vont recevoir des emails d\'approbation');
  warning(`Demande de retrait de ${amount} CFA créée. En attente d'approbation des tiers de confiance.`);

} else {
  // CAS 2: RETRAIT LIBRE - Traitement direct selon le type de coffre
  console.log('🆓 [RETRAIT] ========== CAS 2: RETRAIT LIBRE ==========');
  console.log('🔍 [RETRAIT] Détermination du type de traitement...');
  
  if (vaultData.isGoalBased === false) {
    // ÉPARGNE LIBRE → Remboursement Kkiapay APRÈS validation des tiers
    console.log('💰 [RETRAIT] Type: ÉPARGNE LIBRE → Remboursement Kkiapay avec validation');
    console.log('🔐 [RETRAIT] Validation des tiers de confiance requise pour remboursement Kkiapay');
    
    // Recherche des tiers de confiance actifs avec permission d'approbation
    const activeTrustedParties = trustedParties.filter(tp => 
      tp.status === 'active' && 
      tp.permissions.includes('approve_withdrawals')
    );

    console.log('👥 [RETRAIT] Tiers de confiance trouvés pour validation Kkiapay:', activeTrustedParties.length);

    if (activeTrustedParties.length < 2) {
      console.error('❌ [RETRAIT] Pas assez de tiers de confiance pour validation Kkiapay');
      showError(`Vous devez avoir au moins 2 tiers de confiance actifs pour effectuer un remboursement Kkiapay. Actuellement: ${activeTrustedParties.length} tiers valides.`);
      return;
    }

    // Prendre les 2 premiers tiers de confiance
    const selectedTrustedParties = activeTrustedParties.slice(0, 2).map(tp => ({
      trustedPartyId: tp.id,
      trustedPartyName: tp.name,
      trustedPartyEmail: tp.email,
      accessCode: ''
    }));

    console.log('✅ [RETRAIT] Tiers sélectionnés pour validation Kkiapay:', selectedTrustedParties.map(tp => tp.trustedPartyName));
    console.log('📤 [RETRAIT] Création de la demande de remboursement Kkiapay...');

    // Créer une demande de retrait avec approbation pour remboursement Kkiapay
    const requestId = await createWithdrawalRequest(
      currentUser.uid,
      selectedVault.id,
      selectedVault.name,
      amount,
      `${reason} - Remboursement Kkiapay`,
      selectedTrustedParties
    );

    console.log('✅ [RETRAIT] Demande de remboursement Kkiapay créée avec ID:', requestId);
    console.log('💾 [RETRAIT] Création de la transaction en attente...');

    // Créer une transaction de remboursement Kkiapay en attente
    const transactionRef = await createTransaction({
      amount: -amount,
      paymentMethod: "En attente remboursement Kkiapay",
      status: "pending",
      type: "Retrait",
      userId: currentUser.uid,
      vaultId: selectedVault.id,
      reference: `Kkiapay-${requestId}`,
      reason: `${reason} - Remboursement Kkiapay`
    });

    console.log('✅ [RETRAIT] Transaction Kkiapay créée avec ID:', transactionRef.id);

    // Enregistrer l'ID de la transaction dans la demande de retrait
    await updateDoc(doc(db, 'withdrawalRequests', requestId), {
      transactionId: transactionRef.id,
      isKkiapayRefund: true // Marquer comme remboursement Kkiapay
    });

    console.log('✅ [RETRAIT] Demande de remboursement Kkiapay terminée avec succès');
    warning(`Demande de remboursement Kkiapay de ${amount.toLocaleString()} CFA créée. En attente de validation des tiers de confiance.`);

  } else {
    // OBJECTIF PRÉCIS → Virement manuel après validation
    console.log('🎯 [RETRAIT] Type: OBJECTIF PRÉCIS → Virement manuel avec validation');
    console.log('🔐 [RETRAIT] Validation des tiers de confiance requise pour virement manuel');
    
    // Recherche des tiers de confiance actifs avec permission d'approbation
    const activeTrustedParties = trustedParties.filter(tp => 
      tp.status === 'active' && 
      tp.permissions.includes('approve_withdrawals')
    );

    console.log('👥 [RETRAIT] Tiers de confiance trouvés pour validation virement:', activeTrustedParties.length);

    if (activeTrustedParties.length < 2) {
      console.error('❌ [RETRAIT] Pas assez de tiers de confiance pour validation virement');
      showError(`Vous devez avoir au moins 2 tiers de confiance actifs pour effectuer un virement manuel. Actuellement: ${activeTrustedParties.length} tiers valides.`);
      return;
    }

    // Prendre les 2 premiers tiers de confiance
    const selectedTrustedParties = activeTrustedParties.slice(0, 2).map(tp => ({
      trustedPartyId: tp.id,
      trustedPartyName: tp.name,
      trustedPartyEmail: tp.email,
      accessCode: ''
    }));

    console.log('✅ [RETRAIT] Tiers sélectionnés pour validation virement:', selectedTrustedParties.map(tp => tp.trustedPartyName));
    console.log('📤 [RETRAIT] Création de la demande de virement manuel...');

    // Créer une demande de retrait avec approbation pour virement manuel
    const requestId = await createWithdrawalRequest(
      currentUser.uid,
      selectedVault.id,
      selectedVault.name,
      amount,
      `${reason} - Virement manuel`,
      selectedTrustedParties
    );

    console.log('✅ [RETRAIT] Demande de virement manuel créée avec ID:', requestId);
    console.log('💾 [RETRAIT] Création de la transaction en attente...');

    // Créer une transaction de virement manuel en attente
    const transactionRef = await createTransaction({
      amount: -amount,
      paymentMethod: "En attente virement manuel",
      status: "pending",
      type: "Retrait",
      userId: currentUser.uid,
      vaultId: selectedVault.id,
      reference: `Virement-${requestId}`,
      reason: `${reason} - Virement manuel`
    });

    console.log('✅ [RETRAIT] Transaction virement créée avec ID:', transactionRef.id);

    // Enregistrer l'ID de la transaction dans la demande de retrait
    await updateDoc(doc(db, 'withdrawalRequests', requestId), {
      transactionId: transactionRef.id,
      isManualTransfer: true, // Marquer comme virement manuel
      estimatedProcessingTime: '0-30 minutes' // Temps d'attente estimé
    });

    console.log('✅ [RETRAIT] Demande de virement manuel terminée avec succès');
    warning(`Demande de virement manuel de ${amount.toLocaleString()} CFA créée. Après validation des tiers de confiance, le virement sera effectué manuellement sous 0-30 minutes.`);
  }
}

console.log('🏁 [RETRAIT] ========== FIN DU PROCESSUS DE RETRAIT ==========');
setOpenMenuId(null);
} catch (err) {
console.error('💥 [RETRAIT] ========== ERREUR CRITIQUE ==========');
console.error('❌ [RETRAIT] Détails de l\'erreur:', err);
console.error('❌ [RETRAIT] Stack trace:', err instanceof Error ? err.stack : 'Pas de stack trace');
showError("Impossible de traiter le retrait. Réessayez plus tard.");
}
};

// Débogage : Vérifier la clé d'API
console.log('🔑 [DEBUG] Clé KkiaPay depuis env:', import.meta.env.VITE_KKIAPAY_PUBLIC_KEY);
console.log('🔑 [DEBUG] Type de clé:', typeof import.meta.env.VITE_KKIAPAY_PUBLIC_KEY);

const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();

console.log('🎯 [DEBUG] Hook useKKiaPay initialisé avec succès');
console.log('🎯 [DEBUG] openKkiapayWidget:', typeof openKkiapayWidget);

// écouter les paiements
useEffect(() => {
const successHandler = async (response: { transactionId: string; data: string }) => {
console.log("Paiement réussi :", response);

  const transactionId = response.transactionId;
  const data = JSON.parse(response.data);

  if (!data?.vaultId || !data?.montant) {
    console.error("Montant ou vaultId manquant");
    return;
  }

  try {
    // ✅ Enregistrer la transaction
    await addDoc(collection(db, "transactions"), {
      createdAt: new Date(),
      id_transaction: transactionId,
      montant: data.montant,
      paymentMethod: "Momo",
      status: "active",
      type: "Versement",
      userId: currentUser?.uid,
      vaultId: data.vaultId,
      reference: "Initiateur"
    });
    console.log("Transaction enregistrée !");

    // ✅ Mettre à jour le vault
    const vaultRef = doc(db, "vaults", data.vaultId);
    await updateDoc(vaultRef, {
      current: increment(data.montant)
    });
    console.log(`Vault ${data.vaultId} mis à jour : +${data.montant}`);

    success('Dépôt effectué avec succès !');
  } catch (err) {
    console.error("Erreur lors de l'enregistrement :", err);
    showError("Erreur lors de l'enregistrement du paiement");
  }

  // ✅ Fermer la modale Kkiapay (sans bloquer le reste)
  try {
    if (window.kkiapay) {
      window.kkiapay.close();
    }
  } catch (err) {
    console.warn("Erreur fermeture widget Kkiapay :", err);
  }
};

const failureHandler = (error: Error) => {
  console.error("Paiement échoué :", error);
  showError("Paiement échoué. Veuillez réessayer.");
};

addKkiapayListener("success", successHandler);
addKkiapayListener("failed", failureHandler);

return () => {
  removeKkiapayListener("success");
  removeKkiapayListener("failed");
};
}, [addKkiapayListener, removeKkiapayListener, showError, success]);

useEffect(() => {
// Attendre que l'authentification soit terminée
if (authLoading) return;
if (!currentUser) return;

const q = query(
  collection(db, "vaults"),
  where("userId", "==", currentUser.uid)
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const vaultsData = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Vault[];

  setVaults(vaultsData);
  console.log("Coffres récupérés :", vaultsData);
}, (error) => {
  console.error("Erreur lors de la récupération des coffres:", error);
});

return () => unsubscribe();
}, [authLoading, currentUser]);

const vaultTypes = {
travel: { name: 'Voyage', icon: Plane },
car: { name: 'Véhicule', icon: Car },
home: { name: 'Immobilier', icon: Home },
education: { name: 'Éducation', icon: GraduationCap },
health: { name: 'Santé', icon: Heart },
shopping: { name: 'Shopping', icon: ShoppingBag },
tech: { name: 'Technologie', icon: Smartphone },
emergency: { name: 'Urgence', icon: Shield },
other: { name: 'Autre', icon: Vault }
};

const cardClasses = darkMode
? 'bg-gray-800 border-gray-700'
: 'bg-white border-stone-200';

const handleUnlockVault = async (vaultId: string) => {
try {
await unlockVault(vaultId);
setOpenMenuId(null);
success('Coffre déverrouillé avec succès !');
} catch (err) {
if (err instanceof Error) {
const errorMessage = err.message;

    if (errorMessage.startsWith('UNLOCK_DATE_NOT_REACHED:')) {
      const unlockDate = errorMessage.split(':')[1];
      warning(`Ce coffre ne peut pas encore être déverrouillé. Date de déverrouillage : ${unlockDate}`, 7000);
    } else if (errorMessage.startsWith('ALREADY_UNLOCKED:')) {
      warning('Ce coffre est déjà déverrouillé');
    } else if (errorMessage.startsWith('FIREBASE_ERROR:')) {
      showError('Erreur de connexion. Veuillez réessayer plus tard.');
    } else {
      showError(errorMessage);
    }
  } else {
    showError('Une erreur inattendue s\'est produite');
  }
}
};

// Fonctions pour ouvrir les modals
const handleOpenDepositModal = (vault: Vault) => {
setSelectedVault(vault);
setShowDepositModal(true);
setOpenMenuId(null);
};

const handleOpenWithdrawModal = (vault: Vault) => {
setSelectedVault(vault);
setShowWithdrawModal(true);
setOpenMenuId(null);
};

const openEditModal = (vault: Vault) => {
  handleEditVault(vault);
};

// Pagination
const totalPages = Math.ceil(filteredVaults.length / vaultsPerPage);
const startIndex = (currentPage - 1) * vaultsPerPage;
const paginatedVaults = filteredVaults.slice(startIndex, startIndex + vaultsPerPage);

const goToPrevious = () => {
if (currentPage > 1) {
setCurrentPage(currentPage - 1);
}
};

const goToNext = () => {
if (currentPage < totalPages) {
setCurrentPage(currentPage + 1);
}
};

// Afficher un indicateur de chargement pendant l'authentification
if (authLoading) {
  return (
    <Layout onLogout={onLogout}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Chargement de vos données...
          </p>
        </div>
      </div>
    </Layout>
  );
}

// Rediriger vers la connexion si pas d'utilisateur
if (!currentUser) {
  return (
    <Layout onLogout={onLogout}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    </Layout>
  );
}

return (
<Layout onLogout={onLogout}>
<div className="p-4 sm:p-6 lg:p-8">
{/* Header */}
<div className="mb-8">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
<div>
<h1 className="text-3xl sm:text-4xl font-poly font-bold mb-2">
Mes Coffres d'Épargne
</h1>
<p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
Gérez vos objectifs d'épargne et suivez vos progrès
</p>
</div>
<button
onClick={() => setShowCreateModal(true)}
className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mt-4 sm:mt-0"
>
<Plus className="w-5 h-5 mr-2" />
Nouveau Coffre
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
            placeholder="Rechercher un coffre..."
            className={`px-4 py-2 rounded-xl border transition-colors ${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-stone-200 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "locked" | "completed")}
          className={`px-4 py-2 rounded-xl border transition-colors ${
            darkMode 
              ? 'bg-gray-800 border-gray-600 text-white' 
              : 'bg-white border-stone-200 text-gray-900'
          }`}
        >
          <option value="all">Tous les coffres</option>
          <option value="active">Actifs</option>
          <option value="locked">Verrouillés</option>
          <option value="completed">Complétés</option>
        </select>
      </div>
    </div>

    {/* Loading State */}
    {loading && (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )}

    {/* Error State */}
    {error && (
      <div className={`p-4 rounded-xl border mb-6 ${
        darkMode 
          ? 'bg-red-900/20 border-red-800 text-red-300' 
          : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        <p className="font-semibold">Erreur lors du chargement des coffres:</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )}

    {/* Vaults Grid */}
    {!loading && (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
      {paginatedVaults.map((vault) => {
        const vaultTypeInfo = vaultTypes[vault.type as keyof typeof vaultTypes] || vaultTypes.other;
        const VaultIcon = vaultTypeInfo.icon;
        
        return (
          <div key={vault.id} className="relative">
            {/* COFFRE-FORT RÉALISTE */}
            <div className={`relative w-full h-96 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 ${
              vault.isLocked 
                ? 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800'
            }`}>
              
              {vault.isLocked ? (
                // COFFRE FERMÉ
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-red-600 shadow-inner">
                  {/* Badge de type de coffre - Position bas gauche */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <div className={`px-2 py-1 rounded-lg text-xs font-semibold shadow-md ${
                      vault.isGoalBased === false 
                        ? 'bg-emerald-500/80 text-white border border-emerald-400' 
                        : 'bg-blue-500/80 text-white border border-blue-400'
                    }`}>
                      {vault.isGoalBased === false ? 'Libre' : 'Objectif'}
                    </div>
                  </div>

                  {/* Texture métallique */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
                  }}></div>
                  
                  {/* Porte fermée */}
                  <div className="relative w-full h-full p-6 flex flex-col">
                    {/* Nom du coffre */}
                    <div className="text-center mb-6">
                      <h3 className="font-poly font-bold text-xl text-white mb-2">{vault.name}</h3>
                      <div className="w-16 h-1 bg-red-600 mx-auto rounded-full shadow-lg"></div>
                    </div>

                    {/* Écran LCD rouge */}
                    <div className="bg-red-900 border-2 border-red-600 rounded-lg p-4 mb-6 shadow-inner">
                      <div className="text-center">
                        <div className="text-red-300 text-xs mb-1 font-mono">SYSTÈME SÉCURISÉ</div>
                        <div className="text-red-200 text-lg font-bold mb-2 font-mono">ACCÈS REFUSÉ</div>
                        <div className="text-red-400 text-xs font-mono">🔒 VERROUILLÉ</div>
                      </div>
                    </div>

                    {/* Poignée verrouillée */}
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border-4 border-red-400 shadow-2xl">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Charnières rouges */}
                    <div className="absolute right-2 top-8 space-y-4">
                      <div className="w-3 h-8 bg-gradient-to-r from-red-500 to-red-700 rounded-full shadow-lg"></div>
                      <div className="w-3 h-8 bg-gradient-to-r from-red-500 to-red-700 rounded-full shadow-lg"></div>
                      <div className="w-3 h-8 bg-gradient-to-r from-red-500 to-red-700 rounded-full shadow-lg"></div>
                    </div>

                    {/* Info de déverrouillage */}
                    <div className="mt-auto bg-black/60 rounded-lg p-3 text-center border border-red-800">
                      <div className="text-red-300 text-xs mb-1 font-mono">OUVERTURE PROGRAMMÉE</div>
                      <div className="text-white text-sm font-bold">
                        {vault.unlockDate ? new Date(vault.unlockDate).toLocaleDateString('fr-FR') : 'Non définie'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // COFFRE OUVERT
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-amber-500 shadow-inner">
                  {/* Badge de type de coffre - Position bas gauche */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <div className={`px-2 py-1 rounded-lg text-xs font-semibold shadow-md ${
                      vault.isGoalBased === false 
                        ? 'bg-emerald-500/80 text-white border border-emerald-400' 
                        : 'bg-blue-500/80 text-white border border-blue-400'
                    }`}>
                      {vault.isGoalBased === false ? 'Libre' : 'Objectif'}
                    </div>
                  </div>

                  {/* Texture métallique */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
                  }}></div>
                  
                  <div className="relative w-full h-full flex">
                    {/* PORTE OUVERTE (côté gauche) */}
                    <div className="w-1/2 h-full bg-gradient-to-r from-gray-600 to-gray-700 p-4 flex flex-col border-r-2 border-amber-400">
                      {/* Écran LCD vert */}
                      <div className="bg-green-900 border-2 border-green-600 rounded-lg p-3 mb-4 shadow-inner">
                        <div className="text-center">
                          <div className="text-green-300 text-xs mb-1 font-mono">SOLDE DISPONIBLE</div>
                          <div className="text-green-200 text-lg font-bold mb-1 font-mono">
                            {vault.current.toLocaleString()} CFA
                          </div>
                          {vault.target && (
                            <>
                              <div className="text-green-400 text-xs mb-1 font-mono">OBJECTIF</div>
                              <div className="text-green-300 text-sm font-bold font-mono">
                                {vault.target.toLocaleString()} CFA
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Poignée ronde métallique */}
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center border-4 border-gray-200 shadow-2xl">
                          <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                            <VaultIcon className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Charnières métalliques */}
                      <div className="absolute right-0 top-8 space-y-4">
                        <div className="w-2 h-6 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full shadow-lg"></div>
                        <div className="w-2 h-6 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full shadow-lg"></div>
                        <div className="w-2 h-6 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full shadow-lg"></div>
                      </div>
                    </div>

                    {/* INTÉRIEUR DORÉ (côté droit) */}
                    <div className="w-1/2 h-full bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 p-4 shadow-inner">
                      {/* Nom du coffre */}
                      <div className="mb-4">
                        <h3 className="font-poly font-bold text-lg text-amber-800 mb-1 drop-shadow-sm">{vault.name}</h3>
                        <p className="text-xs text-amber-700">{vaultTypeInfo.name}</p>
                      </div>

                      {/* Étagères avec contenu */}
                      <div className="space-y-3">
                        {/* Étagère 1 - Objectif */}
                        <div className="bg-amber-100 rounded-lg p-2 border-2 border-amber-500 shadow-lg">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-amber-700" />
                            <div>
                              <div className="text-xs text-amber-700 font-bold">OBJECTIF</div>
                              <div className="text-sm text-amber-800 font-bold">
                                {vault.target ? `${vault.target.toLocaleString()} CFA` : 'Libre'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Étagère 2 - Progression */}
                        {vault.target && (
                          <div className="bg-amber-100 rounded-lg p-2 border-2 border-amber-500 shadow-lg">
                            <div className="text-xs text-amber-700 font-bold mb-1">PROGRESSION</div>
                            <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-1000 shadow-sm"
                                style={{ width: `${Math.min((vault.current / vault.target) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-amber-800 font-bold mt-1">
                              {Math.round((vault.current / vault.target) * 100)}%
                            </div>
                          </div>
                        )}

                        {/* Étagère 3 - Détails */}
                        <div className="bg-amber-100 rounded-lg p-2 border-2 border-amber-500 shadow-lg">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-amber-700" />
                            <div>
                              <div className="text-xs text-amber-700 font-bold">DÉBLOCAGE</div>
                              <div className="text-xs text-amber-800">
                                {vault.unlockDate ? new Date(vault.unlockDate).toLocaleDateString('fr-FR') : 'Non définie'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Plaque de série */}
                      <div className="absolute bottom-2 right-2">
                        <div className="bg-amber-600 text-amber-100 px-2 py-1 rounded text-xs font-mono font-bold shadow-lg">
                          ARYWO-{vault.id.toString().substring(0, 3)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu trois points pour coffres ouverts */}
              {!vault.isLocked && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === vault.id ? null : vault.id)}
                      className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 transform hover:scale-110"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {/* Menu déroulant */}
                    {openMenuId === vault.id && (
                      <div className={`absolute right-0 top-12 w-48 rounded-xl shadow-2xl border-2 z-50 ${
                        darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        <div className="p-2">
                          {/* Bouton Dépôt */}
                          <button
                            onClick={() => handleOpenDepositModal(vault)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                              darkMode ? 'text-green-400 hover:bg-green-900/20 hover:text-green-300' 
                                       : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                            }`}
                          >
                            <DollarSign className="w-4 h-4 mr-3" />
                            Effectuer un dépôt
                          </button>

                          {/* Bouton Retrait */}
                          <button
                            onClick={() => handleOpenWithdrawModal(vault)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                              darkMode ? 'text-orange-400 hover:bg-orange-900/20 hover:text-orange-300' 
                                       : 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
                            }`}
                          >
                            <ArrowDownLeft className="w-4 h-4 mr-3" />
                            Retirer des fonds
                          </button>

                          {/* Bouton Modifier */}
                          <button
                            onClick={() => openEditModal(vault)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                              darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                       : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <Edit className="w-4 h-4 mr-3" />
                            Modifier le coffre
                          </button>

                          {/* Séparateur */}
                          <div className={`my-2 h-px ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>

                          {/* Bouton Verrouiller */}
                          <button
                            onClick={() => handleLockVault(vault.id)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                              darkMode ? 'text-amber-400 hover:bg-amber-900/20 hover:text-amber-300' 
                                       : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            <Lock className="w-4 h-4 mr-3" />
                            Verrouiller le coffre
                          </button>

                          <div className={`my-2 h-px ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>

                          {/* Bouton Supprimer */}
                          <button
                            onClick={() => handleDeleteVault(vault.id)}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                              darkMode ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                                       : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                            }`}
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Supprimer le coffre
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bouton de déverrouillage pour coffres verrouillés */}
              {vault.isLocked && (
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={() => handleUnlockVault(vault.id)}
                    className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 transform hover:scale-110"
                    title="Déverrouiller le coffre"
                  >
                    <Unlock className="w-5 h-5" />
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })}
      </div>
    )}

    {/* Pagination */}
    {!loading && filteredVaults.length > 0 && totalPages > 1 && (
      <div className="flex items-center justify-between mb-4">
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Affichage {startIndex + 1}-{Math.min(startIndex + vaultsPerPage, filteredVaults.length)} sur {filteredVaults.length} coffres
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-all duration-200 ${
              currentPage === 1
                ? darkMode 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 cursor-not-allowed'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className={`px-3 py-1 text-sm font-poly font-semibold ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-all duration-200 ${
              currentPage === totalPages
                ? darkMode 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 cursor-not-allowed'
                : darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )}

    {!loading && filteredVaults.length === 0 && (
      <div className={`text-center py-12 rounded-2xl border ${cardClasses}`}>
        <div className="text-6xl mb-4 text-amber-500">
          <Vault className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="font-poly font-bold text-xl mb-2">Aucun coffre trouvé</h3>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          {filterStatus === 'all' 
            ? 'Créez votre premier coffre d\'épargne pour commencer'
            : `Aucun coffre ${filterStatus === 'active' ? 'actif' : filterStatus === 'locked' ? 'verrouillé' : 'complété'} trouvé`
          }
        </p>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-bold hover:from-amber-500 hover:to-amber-600 transition-all duration-200"
        >
          Créer un coffre
        </button>
      </div>
    )}
  </div>

  {/* Modals */}
  <CreateVaultModal
    isOpen={showCreateModal}
    onClose={() => setShowCreateModal(false)}
    onSubmit={handleCreateVault}
    darkMode={darkMode}
  />

  <DepositModal
    isOpen={showDepositModal}
    onClose={() => {
      setShowDepositModal(false);
      setSelectedVault(null);
    }}
    onDeposit={handleDepositFromModal}
    darkMode={darkMode}
    vaultName={selectedVault?.name || ''}
  />

  <WithdrawModal
    isOpen={showWithdrawModal}
    onClose={() => {
      setShowWithdrawModal(false);
      setSelectedVault(null);
    }}
    onWithdraw={handleWithdrawFromModal}
    darkMode={darkMode}
    vaultName={selectedVault?.name || ''}
    currentBalance={selectedVault?.current || 0}
  />

  {selectedVault && (
    <EditVaultModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      vault={{
        id: selectedVault.id,
        userId: selectedVault.userId,
        name: selectedVault.name,
        current: selectedVault.current,
        target: selectedVault.target,
        type: selectedVault.type,
        status: selectedVault.status,
        monthlyContrib: selectedVault.monthlyContrib,
        daysLeft: selectedVault.daysLeft,
        createdAt: selectedVault.createdAt,
        updatedAt: selectedVault.updatedAt,
        isGoalBased: selectedVault.isGoalBased,
        isLocked: selectedVault.isLocked,
        unlockDate: selectedVault.unlockDate,
        description: selectedVault.description,
        trustedThirdPartyId: selectedVault.trustedThirdPartyId,
        lockConditions: selectedVault.lockConditions,
      }}
      darkMode={darkMode}
    />
  )}
</Layout>
);
}
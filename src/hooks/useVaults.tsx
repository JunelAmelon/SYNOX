import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

export interface Vault {
  id: string;
  userId: string;
  name: string;
  current: number;
  target: number | null;
  type: 'travel' | 'car' | 'home' | 'education' | 'health' | 'shopping' | 'tech' | 'emergency' | 'other';
  status: 'active' | 'locked' | 'completed' | 'paused';
  monthlyContrib: number | null;
  daysLeft: number | null;
  createdAt: string;
  updatedAt: string;
  isGoalBased: boolean;
  isLocked: boolean;
  unlockDate: string | null;
  description?: string;
  trustedThirdPartyId?: string;
  lockConditions?: {
    minAmount?: number;
    lockDuration?: number; // en jours
    requireThirdPartyApproval?: boolean;
  };
}

export interface CreateVaultData {
  name: string;
  target: number | null;
  type: Vault['type'];
  monthlyContrib: number | null;
  isGoalBased: boolean;
  description?: string;
  lockConditions?: Vault['lockConditions'];
}

export interface UpdateVaultData {
  name?: string;
  target?: number | null;
  monthlyContrib?: number | null;
  description?: string;
}

export interface VaultTransaction {
  id: string;
  vaultId: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'interest';
  description: string;
  createdAt: string;
}

export function useVaults() {
  const { currentUser } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!currentUser) {
      setVaults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const vaultsRef = collection(db, 'vaults');
    const q = query(
      vaultsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const vaultsData: Vault[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          vaultsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          } as Vault);
        });
        setVaults(vaultsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erreur lors de la récupération des coffres:', err);
        setError('Erreur lors du chargement des coffres');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Créer un nouveau coffre
  const createVault = async (vaultData: CreateVaultData): Promise<string> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const now = new Date().toISOString();
      const newVault: Omit<Vault, 'id'> = {
        userId: currentUser.uid,
        name: vaultData.name,
        current: 0,
        target: vaultData.target,
        type: vaultData.type,
        status: 'active',
        monthlyContrib: vaultData.monthlyContrib,
        daysLeft: vaultData.target && vaultData.monthlyContrib 
          ? Math.ceil((vaultData.target) / vaultData.monthlyContrib * 30)
          : null,
        createdAt: now,
        updatedAt: now,
        isGoalBased: vaultData.isGoalBased,
        isLocked: false,
        unlockDate: null,
        description: vaultData.description,
        lockConditions: vaultData.lockConditions,
      };

      const docRef = await addDoc(collection(db, 'vaults'), {
        ...newVault,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      return docRef.id;
    } catch (err) {
      console.error('Erreur lors de la création du coffre:', err);
      throw new Error('Impossible de créer le coffre');
    }
  };

  // Mettre à jour un coffre
  const updateVault = async (vaultId: string, updateData: UpdateVaultData): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const vaultRef = doc(db, 'vaults', vaultId);
      await updateDoc(vaultRef, {
        ...updateData,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour du coffre:', err);
      throw new Error('Impossible de mettre à jour le coffre');
    }
  };

  // Supprimer un coffre
  const deleteVault = async (vaultId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      await deleteDoc(doc(db, 'vaults', vaultId));
    } catch (err) {
      console.error('Erreur lors de la suppression du coffre:', err);
      throw new Error('Impossible de supprimer le coffre');
    }
  };

  // Verrouiller un coffre
  const lockVault = async (vaultId: string, unlockDate?: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const vault = vaults.find(v => v.id === vaultId);
      if (!vault) {
        throw new Error('Coffre introuvable');
      }

      const lockDate = unlockDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      await updateVault(vaultId, {});
      
      const vaultRef = doc(db, 'vaults', vaultId);
      await updateDoc(vaultRef, {
        isLocked: true,
        status: 'locked',
        unlockDate: lockDate,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (err) {
      console.error('Erreur lors du verrouillage du coffre:', err);
      throw new Error('Impossible de verrouiller le coffre');
    }
  };

  // Déverrouiller un coffre
  const unlockVault = async (vaultId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) {
      throw new Error('Coffre introuvable');
    }

    // Vérifier si le coffre peut être déverrouillé
    if (vault.unlockDate && new Date(vault.unlockDate) > new Date()) {
      const unlockDate = new Date(vault.unlockDate);
      const formattedDate = unlockDate.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      throw new Error(`UNLOCK_DATE_NOT_REACHED:${formattedDate}`);
    }

    // Vérifier si le coffre est déjà déverrouillé
    if (!vault.isLocked) {
      throw new Error('ALREADY_UNLOCKED:Le coffre est déjà déverrouillé');
    }

    try {
      const vaultRef = doc(db, 'vaults', vaultId);
      await updateDoc(vaultRef, {
        isLocked: false,
        status: 'active',
        unlockDate: null,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (err) {
      // Log only for debugging, don't show to user
      console.error('Erreur Firebase lors du déverrouillage:', err);
      throw new Error('FIREBASE_ERROR:Erreur de connexion à la base de données');
    }
  };

  // Ajouter de l'argent à un coffre
  const depositToVault = async (vaultId: string, amount: number, description: string = 'Dépôt'): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    if (amount <= 0) {
      throw new Error('Le montant doit être positif');
    }

    try {
      const vault = vaults.find(v => v.id === vaultId);
      if (!vault) {
        throw new Error('Coffre introuvable');
      }

      if (vault.isLocked) {
        throw new Error('Impossible de déposer dans un coffre verrouillé');
      }

      const newAmount = vault.current + amount;
      let newStatus = vault.status;

      // Vérifier si l'objectif est atteint
      if (vault.target && newAmount >= vault.target && vault.status === 'active') {
        newStatus = 'completed';
      }

      // Mettre à jour le coffre
      const vaultRef = doc(db, 'vaults', vaultId);
      await updateDoc(vaultRef, {
        current: newAmount,
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Enregistrer la transaction
      await addDoc(collection(db, 'transactions'), {
        vaultId,
        userId: currentUser.uid,
        amount,
        type: 'deposit',
        description,
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (err) {
      console.error('Erreur lors du dépôt:', err);
      throw new Error('Impossible d\'effectuer le dépôt');
    }
  };

  // Retirer de l'argent d'un coffre
  const withdrawFromVault = async (vaultId: string, amount: number, description: string = 'Retrait'): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    if (amount <= 0) {
      throw new Error('Le montant doit être positif');
    }

    try {
      const vault = vaults.find(v => v.id === vaultId);
      if (!vault) {
        throw new Error('Coffre introuvable');
      }

      if (vault.isLocked) {
        throw new Error('Impossible de retirer d\'un coffre verrouillé');
      }

      if (amount > vault.current) {
        throw new Error('Solde insuffisant');
      }

      const newAmount = vault.current - amount;

      // Mettre à jour le coffre
      const vaultRef = doc(db, 'vaults', vaultId);
      await updateDoc(vaultRef, {
        current: newAmount,
        status: newAmount === 0 ? 'active' : vault.status,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Enregistrer la transaction
      await addDoc(collection(db, 'transactions'), {
        vaultId,
        userId: currentUser.uid,
        amount: -amount,
        type: 'withdrawal',
        description,
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (err) {
      console.error('Erreur lors du retrait:', err);
      throw new Error('Impossible d\'effectuer le retrait');
    }
  };

  // Calculer les statistiques
  const getVaultStats = () => {
    const totalSaved = vaults.reduce((sum, vault) => sum + vault.current, 0);
    const totalTarget = vaults.reduce((sum, vault) => sum + (vault.target || 0), 0);
    const activeVaults = vaults.filter(v => v.status === 'active').length;
    const completedVaults = vaults.filter(v => v.status === 'completed').length;
    const lockedVaults = vaults.filter(v => v.isLocked).length;

    return {
      totalSaved,
      totalTarget,
      activeVaults,
      completedVaults,
      lockedVaults,
      totalVaults: vaults.length,
      averageProgress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    };
  };

  // Filtrer les coffres
  const filterVaults = (status?: string, type?: string, searchTerm?: string) => {
    return vaults.filter(vault => {
      const matchesStatus = !status || status === 'all' || vault.status === status;
      const matchesType = !type || type === 'all' || vault.type === type;
      const matchesSearch = !searchTerm || 
        vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vault.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesType && matchesSearch;
    });
  };

  return {
    vaults,
    loading,
    error,
    createVault,
    updateVault,
    deleteVault,
    lockVault,
    unlockVault,
    depositToVault,
    withdrawFromVault,
    getVaultStats,
    filterVaults,
  };
}

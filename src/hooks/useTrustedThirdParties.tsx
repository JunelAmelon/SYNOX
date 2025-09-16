import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { emailService, TrustedPartyInvitationData } from '../lib/emailService';

export type TrustedPartyStatus = 'active' | 'pending' | 'inactive' | 'revoked';
export type Permission = 'view_vaults' | 'manage_vaults' | 'emergency_access' | 'view_analytics' | 'approve_withdrawals';
export type RelationshipType = 'Famille' | 'Conjoint' | 'Ami proche' | 'Conseiller financier' | 'Autre';

export interface TrustedThirdParty {
  id: string;
  userId: string; // Propriétaire qui a ajouté ce tiers
  name: string;
  email: string;
  phone: string;
  relationship: RelationshipType;
  status: TrustedPartyStatus;
  permissions: Permission[];
  addedDate: string;
  lastAccess: string | null;
  avatar: string;
  invitationToken?: string;
  invitationExpiry?: string;
  notes?: string;
  emergencyContactPriority?: number; // 1 = priorité haute, 2 = moyenne, 3 = basse
}

export interface CreateTrustedPartyData {
  name: string;
  email: string;
  phone: string;
  relationship: RelationshipType;
  permissions: Permission[];
  notes?: string;
  emergencyContactPriority?: number;
}

export interface UpdateTrustedPartyData {
  name?: string;
  email?: string;
  phone?: string;
  relationship?: RelationshipType;
  permissions?: Permission[];
  notes?: string;
  emergencyContactPriority?: number;
}

export interface TrustedPartyInvitation {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toEmail: string;
  permissions: Permission[];
  status: 'sent' | 'accepted' | 'declined' | 'expired';
  token: string;
  createdAt: string;
  expiresAt: string;
}

export interface EmergencyAccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  targetUserId: string;
  vaultId?: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requestedAt: string;
  respondedAt?: string;
  expiresAt: string;
}

export function useTrustedThirdParties() {
  const { currentUser } = useAuth();
  const [trustedParties, setTrustedParties] = useState<TrustedThirdParty[]>([]);
  const [invitations, setInvitations] = useState<TrustedPartyInvitation[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Écouter les changements des tiers de confiance
  useEffect(() => {
    if (!currentUser) {
      setTrustedParties([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const partiesRef = collection(db, 'trustedThirdParties');
    const q = query(
      partiesRef,
      where('userId', '==', currentUser.uid),
      orderBy('addedDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const partiesData: TrustedThirdParty[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          partiesData.push({
            id: doc.id,
            ...data,
            addedDate: data.addedDate?.toDate?.()?.toISOString() || data.addedDate,
            lastAccess: data.lastAccess?.toDate?.()?.toISOString() || data.lastAccess,
          } as TrustedThirdParty);
        });
        setTrustedParties(partiesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erreur lors de la récupération des tiers de confiance:', err);
        setError('Erreur lors du chargement des tiers de confiance');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Écouter les invitations
  useEffect(() => {
    if (!currentUser) {
      setInvitations([]);
      return;
    }

    const invitationsRef = collection(db, 'trustedPartyInvitations');
    const q = query(
      invitationsRef,
      where('fromUserId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const invitationsData: TrustedPartyInvitation[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          invitationsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt,
          } as TrustedPartyInvitation);
        });
        setInvitations(invitationsData);
      },
      (err) => {
        console.error('Erreur lors de la récupération des invitations:', err);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Créer un nouveau tiers de confiance
  const createTrustedParty = async (partyData: CreateTrustedPartyData): Promise<string> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const now = new Date();
      const invitationToken = generateInvitationToken();
      const invitationExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 jours

      const newParty: Omit<TrustedThirdParty, 'id'> = {
        userId: currentUser.uid,
        name: partyData.name,
        email: partyData.email,
        phone: partyData.phone,
        relationship: partyData.relationship,
        status: 'pending',
        permissions: partyData.permissions,
        addedDate: now.toISOString(),
        lastAccess: null,
        avatar: generateAvatar(partyData.name),
        invitationToken,
        invitationExpiry: invitationExpiry.toISOString(),
        notes: partyData.notes,
        emergencyContactPriority: partyData.emergencyContactPriority,
      };

      const docRef = await addDoc(collection(db, 'trustedThirdParties'), {
        ...newParty,
        addedDate: Timestamp.fromDate(now),
        invitationExpiry: Timestamp.fromDate(invitationExpiry),
      });

      // Créer l'invitation
      await addDoc(collection(db, 'trustedPartyInvitations'), {
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName || currentUser.email,
        toEmail: partyData.email,
        permissions: partyData.permissions,
        status: 'sent',
        token: invitationToken,
        createdAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(invitationExpiry),
      });

      // Envoyer l'email d'invitation
      try {
        const invitationData: TrustedPartyInvitationData = {
          inviterName: currentUser.displayName || currentUser.email || 'Utilisateur SYNOX',
          inviterEmail: currentUser.email || '',
          trustedPartyName: partyData.name,
          trustedPartyEmail: partyData.email,
          permissions: partyData.permissions,
          invitationToken,
          acceptUrl: `${window.location.origin}/accept-invitation?token=${invitationToken}`,
          expiryDate: invitationExpiry.toISOString(),
        };

        await emailService.sendTrustedPartyInvitation(invitationData);
        console.log('Email d\'invitation envoyé avec succès');
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', emailError);
        // Ne pas faire échouer la création si l'email échoue
      }

      return docRef.id;
    } catch (err) {
      console.error('Erreur lors de la création du tiers de confiance:', err);
      throw new Error('Impossible de créer le tiers de confiance');
    }
  };

  // Mettre à jour un tiers de confiance
  const updateTrustedParty = async (partyId: string, updateData: UpdateTrustedPartyData): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const partyRef = doc(db, 'trustedThirdParties', partyId);
      const updatePayload: any = { ...updateData };
      
      if (updateData.name) {
        updatePayload.avatar = generateAvatar(updateData.name);
      }

      await updateDoc(partyRef, updatePayload);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du tiers de confiance:', err);
      throw new Error('Impossible de mettre à jour le tiers de confiance');
    }
  };

  // Supprimer un tiers de confiance
  const deleteTrustedParty = async (partyId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      await deleteDoc(doc(db, 'trustedThirdParties', partyId));
    } catch (err) {
      console.error('Erreur lors de la suppression du tiers de confiance:', err);
      throw new Error('Impossible de supprimer le tiers de confiance');
    }
  };

  // Changer le statut d'un tiers de confiance
  const changePartyStatus = async (partyId: string, status: TrustedPartyStatus): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const partyRef = doc(db, 'trustedThirdParties', partyId);
      await updateDoc(partyRef, { status });
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      throw new Error('Impossible de changer le statut');
    }
  };

  // Révoquer l'accès d'un tiers de confiance
  const revokeAccess = async (partyId: string): Promise<void> => {
    await changePartyStatus(partyId, 'revoked');
  };

  // Réactiver un tiers de confiance
  const reactivateParty = async (partyId: string): Promise<void> => {
    await changePartyStatus(partyId, 'active');
  };

  // Renvoyer une invitation
  const resendInvitation = async (partyId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const party = trustedParties.find(p => p.id === partyId);
      if (!party) {
        throw new Error('Tiers de confiance introuvable');
      }

      const now = new Date();
      const newToken = generateInvitationToken();
      const newExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Mettre à jour le tiers de confiance
      const partyRef = doc(db, 'trustedThirdParties', partyId);
      await updateDoc(partyRef, {
        invitationToken: newToken,
        invitationExpiry: Timestamp.fromDate(newExpiry),
        status: 'pending'
      });

      // Créer une nouvelle invitation
      await addDoc(collection(db, 'trustedPartyInvitations'), {
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName || currentUser.email,
        toEmail: party.email,
        permissions: party.permissions,
        status: 'sent',
        token: newToken,
        createdAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(newExpiry),
      });
    } catch (err) {
      console.error('Erreur lors du renvoi de l\'invitation:', err);
      throw new Error('Impossible de renvoyer l\'invitation');
    }
  };

  // Mettre à jour les permissions
  const updatePermissions = async (partyId: string, permissions: Permission[]): Promise<void> => {
    await updateTrustedParty(partyId, { permissions });
  };

  // Enregistrer l'accès d'un tiers de confiance
  const recordAccess = async (partyId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const partyRef = doc(db, 'trustedThirdParties', partyId);
      await updateDoc(partyRef, {
        lastAccess: Timestamp.fromDate(new Date())
      });
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'accès:', err);
    }
  };

  // Calculer les statistiques
  const getStats = () => {
    const totalParties = trustedParties.length;
    const activeParties = trustedParties.filter(p => p.status === 'active').length;
    const pendingParties = trustedParties.filter(p => p.status === 'pending').length;
    const emergencyAccessParties = trustedParties.filter(p => 
      p.permissions.includes('emergency_access') && p.status === 'active'
    ).length;
    const inactiveParties = trustedParties.filter(p => p.status === 'inactive').length;

    return {
      totalParties,
      activeParties,
      pendingParties,
      emergencyAccessParties,
      inactiveParties,
    };
  };

  // Filtrer les tiers de confiance
  const filterParties = (status?: string, relationship?: string, searchTerm?: string) => {
    return trustedParties.filter(party => {
      const matchesStatus = !status || status === 'all' || party.status === status;
      const matchesRelationship = !relationship || relationship === 'all' || party.relationship === relationship;
      const matchesSearch = !searchTerm || 
        party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.phone.includes(searchTerm);
      
      return matchesStatus && matchesRelationship && matchesSearch;
    });
  };

  // Obtenir les tiers de confiance par permission
  const getPartiesByPermission = (permission: Permission) => {
    return trustedParties.filter(party => 
      party.permissions.includes(permission) && party.status === 'active'
    );
  };

  // Fonctions utilitaires
  const generateInvitationToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const generateAvatar = (name: string): string => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return {
    trustedParties,
    invitations,
    emergencyRequests,
    loading,
    error,
    createTrustedParty,
    updateTrustedParty,
    deleteTrustedParty,
    changePartyStatus,
    revokeAccess,
    reactivateParty,
    resendInvitation,
    updatePermissions,
    recordAccess,
    getStats,
    filterParties,
    getPartiesByPermission,
  };
}

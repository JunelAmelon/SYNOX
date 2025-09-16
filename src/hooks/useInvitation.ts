import { useState } from 'react';
import { doc, getDoc, updateDoc, collection, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { emailService } from '../lib/emailService';

export interface InvitationData {
  id: string;
  inviterName: string;
  inviterEmail: string;
  trustedPartyEmail: string;
  permissions: string[];
  expiryDate: Timestamp | Date;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Timestamp | Date;
}

export interface AcceptInvitationResult {
  success: boolean;
  accessCode?: string;
  error?: string;
}

export const useInvitation = () => {
  const [loading, setLoading] = useState(false);

  const acceptInvitation = async (
    token: string, 
    trustedPartyName: string
  ): Promise<AcceptInvitationResult> => {
    setLoading(true);
    
    try {
      // Chercher l'invitation par le champ token, pas par l'ID du document
      const invitationsRef = collection(db, 'trustedPartyInvitations');
      const q = query(invitationsRef, where('token', '==', token));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Invitation non trouvée ou expirée' };
      }
      
      const invitationDoc = querySnapshot.docs[0];
      
      // Utiliser directement les données avec la structure réelle
      const invitationData = invitationDoc.data() as {
        toEmail: string;
        fromUserId: string;
        fromUserName: string;
        permissions: string[];
        status: string;
        token: string;
        expiresAt: Timestamp | Date;
      };
      
      // Vérifier si l'invitation n'a pas expiré
      const expiryDate = invitationData.expiresAt instanceof Date 
        ? invitationData.expiresAt 
        : (invitationData.expiresAt as Timestamp).toDate();
        
      if (expiryDate < new Date()) {
        return { success: false, error: 'Cette invitation a expiré' };
      }
      
      // Vérifier si l'invitation n'a pas déjà été acceptée
      if (invitationData.status === 'accepted') {
        return { success: false, error: 'Cette invitation a déjà été acceptée' };
      }
      
      // Générer un code d'accès unique (12 chiffres)
      const accessCode = Math.random().toString().slice(2, 14).padStart(12, '0');
      
      // Trouver l'entrée correspondante dans trustedThirdParties par token
      const trustedPartiesRef = collection(db, 'trustedThirdParties');
      const trustedPartyQuery = query(
        trustedPartiesRef, 
        where('invitationToken', '==', invitationData.token),
        where('userId', '==', invitationData.fromUserId)
      );
      const trustedPartySnapshot = await getDocs(trustedPartyQuery);
      
      if (trustedPartySnapshot.empty) {
        return { success: false, error: 'Entrée tiers de confiance non trouvée' };
      }
      
      const trustedPartyDoc = trustedPartySnapshot.docs[0];
      
      // Mettre à jour l'entrée existante dans trustedThirdParties
      await updateDoc(doc(db, 'trustedThirdParties', trustedPartyDoc.id), {
        status: 'active',
        lastAccess: Timestamp.fromDate(new Date()),
        // Ajouter le code d'accès si nécessaire pour votre logique métier
        accessCode: accessCode
      });
      
      // Mettre à jour le statut de l'invitation
      await updateDoc(doc(db, 'trustedPartyInvitations', invitationDoc.id), {
        status: 'accepted',
        acceptedAt: Timestamp.fromDate(new Date()),
        trustedPartyName: trustedPartyName
      });
      
      // Envoyer l'email avec le code d'accès
      try {
        await emailService.sendTrustedPartyAccessCode(
          invitationData.toEmail,
          {
            trustedPartyName: trustedPartyName,
            inviterName: invitationData.fromUserName,
            accessCode: accessCode,
            permissions: invitationData.permissions
          }
        );
      } catch (emailError) {
        console.warn('Erreur lors de l\'envoi de l\'email:', emailError);
        // Ne pas faire échouer l'acceptation si l'email échoue
      }
      
      return { 
        success: true, 
        accessCode: accessCode 
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      return { 
        success: false, 
        error: 'Erreur technique. Veuillez réessayer plus tard.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const getInvitationDetails = async (token: string): Promise<InvitationData | null> => {
    try {
      const invitationRef = doc(db, 'trustedPartyInvitations', token);
      const invitationSnap = await getDoc(invitationRef);
      
      if (!invitationSnap.exists()) {
        return null;
      }
      
      return { id: invitationSnap.id, ...invitationSnap.data() } as InvitationData;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'invitation:', error);
      return null;
    }
  };

  return {
    acceptInvitation,
    getInvitationDetails,
    loading
  };
};

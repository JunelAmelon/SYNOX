import { useState } from 'react';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { emailService } from '../lib/emailService';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  vaultId: string;
  vaultName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  requiredApprovals: number;
  approvals: {
    trustedPartyId: string;
    trustedPartyName: string;
    trustedPartyEmail: string;
    approved: boolean;
    approvedAt?: Date;
  }[];
}

export interface TrustedPartyApproval {
  trustedPartyId: string;
  trustedPartyName: string;
  trustedPartyEmail: string;
  accessCode: string;
}

export const useWithdrawalApproval = () => {
  const [loading, setLoading] = useState(false);

  const createWithdrawalRequest = async (
    userId: string,
    vaultId: string,
    vaultName: string,
    amount: number,
    reason: string,
    trustedParties: TrustedPartyApproval[]
  ): Promise<string> => {
    setLoading(true);
    
    try {
      // Créer la demande de retrait
      const withdrawalRequest = {
        userId,
        vaultId,
        vaultName,
        amount,
        reason,
        status: 'pending',
        createdAt: Timestamp.fromDate(new Date()),
        requiredApprovals: trustedParties.length,
        approvals: trustedParties.map(tp => ({
          trustedPartyId: tp.trustedPartyId,
          trustedPartyName: tp.trustedPartyName,
          trustedPartyEmail: tp.trustedPartyEmail,
          approved: false
        }))
      };

      const docRef = await addDoc(collection(db, 'withdrawalRequests'), withdrawalRequest);

      // Envoyer les emails aux tiers de confiance
      for (const trustedParty of trustedParties) {
        try {
          await emailService.sendWithdrawalApprovalRequest({
            trustedPartyName: trustedParty.trustedPartyName,
            trustedPartyEmail: trustedParty.trustedPartyEmail,
            userName: 'Utilisateur SYNOX', // À remplacer par le vrai nom
            vaultName,
            amount,
            reason,
            approvalUrl: `${window.location.origin}/approve-withdrawal?requestId=${docRef.id}&partyId=${trustedParty.trustedPartyId}`,
            requestId: docRef.id
          });
        } catch (emailError) {
          console.warn('Erreur lors de l\'envoi de l\'email à', trustedParty.trustedPartyEmail, emailError);
        }
      }

      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la demande de retrait:', error);
      throw new Error('Impossible de créer la demande de retrait');
    } finally {
      setLoading(false);
    }
  };

  const approveWithdrawal = async (
    requestId: string,
    trustedPartyId: string,
    accessCode: string
  ): Promise<{ success: boolean; error?: string; allApproved?: boolean }> => {
    setLoading(true);

    try {
      // Vérifier le code d'accès
      const trustedPartiesRef = collection(db, 'trustedThirdParties');
      const q = query(trustedPartiesRef, where('accessCode', '==', accessCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, error: 'Code d\'accès invalide' };
      }

      const trustedPartyDoc = querySnapshot.docs[0];
      const trustedPartyData = trustedPartyDoc.data();

      if (trustedPartyDoc.id !== trustedPartyId) {
        return { success: false, error: 'Code d\'accès ne correspond pas à ce tiers de confiance' };
      }

      // Récupérer la demande de retrait
      const withdrawalRequestsRef = collection(db, 'withdrawalRequests');
      const requestQuery = query(withdrawalRequestsRef, where('__name__', '==', requestId));
      const requestSnapshot = await getDocs(requestQuery);

      if (requestSnapshot.empty) {
        return { success: false, error: 'Demande de retrait non trouvée' };
      }

      const requestDoc = requestSnapshot.docs[0];
      const requestData = requestDoc.data() as WithdrawalRequest;

      // Vérifier si déjà approuvé par ce tiers
      const existingApproval = requestData.approvals.find(a => a.trustedPartyId === trustedPartyId);
      if (!existingApproval) {
        return { success: false, error: 'Vous n\'êtes pas autorisé à approuver cette demande' };
      }

      if (existingApproval.approved) {
        return { success: false, error: 'Vous avez déjà approuvé cette demande' };
      }

      // Mettre à jour l'approbation
      const updatedApprovals = requestData.approvals.map(approval => 
        approval.trustedPartyId === trustedPartyId
          ? { ...approval, approved: true, approvedAt: new Date() }
          : approval
      );

      const allApproved = updatedApprovals.every(a => a.approved);
      const newStatus = allApproved ? 'approved' : 'pending';

      await updateDoc(doc(db, 'withdrawalRequests', requestId), {
        approvals: updatedApprovals,
        status: newStatus,
        ...(allApproved && { approvedAt: Timestamp.fromDate(new Date()) })
      });

      return { 
        success: true, 
        allApproved 
      };

    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      return { success: false, error: 'Erreur technique lors de l\'approbation' };
    } finally {
      setLoading(false);
    }
  };

  const getWithdrawalRequest = async (requestId: string): Promise<WithdrawalRequest | null> => {
    try {
      const withdrawalRequestsRef = collection(db, 'withdrawalRequests');
      const q = query(withdrawalRequestsRef, where('__name__', '==', requestId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as WithdrawalRequest;
    } catch (error) {
      console.error('Erreur lors de la récupération de la demande:', error);
      return null;
    }
  };

  return {
    createWithdrawalRequest,
    approveWithdrawal,
    getWithdrawalRequest,
    loading
  };
};

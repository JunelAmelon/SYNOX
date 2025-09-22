import { useState } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { emailService } from '../lib/emailService';
import { KkiapayService } from '../lib/kkiapayService';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  vaultId: string;
  vaultName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  createdAt: Date;
  approvedAt?: Date;
  requiredApprovals: number;
  transactionId?: string; // ID de la transaction associée
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
      console.log('🚀 [WithdrawalApproval] Envoi d\'emails aux tiers de confiance...');
      console.log('📝 [WithdrawalApproval] Nombre de tiers de confiance:', trustedParties.length);
      console.log('📝 [WithdrawalApproval] Liste des tiers:', trustedParties.map(tp => ({
        name: tp.trustedPartyName,
        email: tp.trustedPartyEmail,
        id: tp.trustedPartyId
      })));

      for (const trustedParty of trustedParties) {
        try {
          console.log(`📧 [WithdrawalApproval] Envoi email à ${trustedParty.trustedPartyName} (${trustedParty.trustedPartyEmail})`);
          
          const emailData = {
            trustedPartyName: trustedParty.trustedPartyName,
            trustedPartyEmail: trustedParty.trustedPartyEmail,
            userName: 'Utilisateur SYNOX', // À remplacer par le vrai nom
            vaultName,
            amount,
            reason,
            approvalUrl: `${window.location.origin}/approve-withdrawal?requestId=${docRef.id}&partyId=${trustedParty.trustedPartyId}`,
            requestId: docRef.id
          };

          console.log(`📧 [WithdrawalApproval] Données email:`, emailData);

          const emailResult = await emailService.sendWithdrawalApprovalRequest(emailData);
          
          if (emailResult) {
            console.log(`✅ [WithdrawalApproval] Email envoyé avec succès à ${trustedParty.trustedPartyEmail}`);
          } else {
            console.warn(`⚠️ [WithdrawalApproval] Échec d'envoi email à ${trustedParty.trustedPartyEmail}`);
          }
        } catch (emailError) {
          console.error(`❌ [WithdrawalApproval] Erreur lors de l'envoi de l'email à ${trustedParty.trustedPartyEmail}:`, emailError);
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

      // Si tous les tiers ont approuvé, traiter le retrait automatiquement
      if (allApproved) {
        await processWithdrawal(requestData, requestId);
      }

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

  // Traiter le retrait après approbation complète
  const processWithdrawal = async (requestData: WithdrawalRequest, requestId: string): Promise<void> => {
    try {
      console.log('🚀 [ProcessWithdrawal] Début du traitement du retrait approuvé');
      
      // 1. Récupérer les informations du coffre
      const vaultRef = doc(db, 'vaults', requestData.vaultId);
      const vaultDoc = await getDoc(vaultRef);
      
      if (!vaultDoc.exists()) {
        throw new Error('Coffre non trouvé');
      }

      const vaultData = vaultDoc.data();
      const newBalance = vaultData.current - requestData.amount;

      if (newBalance < 0) {
        throw new Error('Solde insuffisant dans le coffre');
      }

      console.log('📊 [ProcessWithdrawal] Type de coffre:', vaultData.isGoalBased ? 'Objectif précis' : 'Épargne libre');

      // 2. Débiter le coffre
      await updateDoc(vaultRef, {
        current: newBalance,
        updatedAt: Timestamp.fromDate(new Date())
      });

      // 3. Traitement selon le type de coffre
      if (vaultData.isGoalBased === false) {
        // ÉPARGNE LIBRE → Remboursement Kkiapay
        console.log('💰 [ProcessWithdrawal] Épargne libre - Initiation du remboursement Kkiapay');
        await processKkiapayRefund(requestData, requestId);
      } else {
        // OBJECTIF PRÉCIS → Autre logique (à implémenter plus tard)
        console.log('🎯 [ProcessWithdrawal] Objectif précis - Logique standard');
        await processStandardWithdrawal(requestData, requestId);
      }

      console.log('✅ [ProcessWithdrawal] Retrait traité avec succès');

    } catch (error) {
      console.error('❌ [ProcessWithdrawal] Erreur lors du traitement du retrait:', error);
      
      // Marquer la demande comme échouée
      await updateDoc(doc(db, 'withdrawalRequests', requestId), {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        failedAt: Timestamp.fromDate(new Date())
      });
      
      throw error;
    }
  };

  // Traitement par remboursement Kkiapay (pour épargne libre)
  const processKkiapayRefund = async (requestData: WithdrawalRequest, requestId: string): Promise<void> => {
    try {
      console.log('🔄 [KkiapayRefund] Début du processus de remboursement Kkiapay');
      
      // 1. Rechercher la transaction de dépôt la plus récente pour ce coffre
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('vaultId', '==', requestData.vaultId),
        where('userId', '==', requestData.userId),
        where('type', '==', 'Versement'),
        where('status', '==', 'active'),
        where('paymentMethod', '==', 'Momo')
      );
      
      const transactionSnapshot = await getDocs(q);
      
      if (transactionSnapshot.empty) {
        console.warn('⚠️ [KkiapayRefund] Aucune transaction Kkiapay trouvée pour remboursement');
        // Fallback vers traitement standard
        await processStandardWithdrawal(requestData, requestId);
        return;
      }

      // Prendre la transaction la plus récente
      const transactions = transactionSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Trier par date de création (plus récent en premier)
      transactions.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      const latestTransaction = transactions[0];
      console.log('📋 [KkiapayRefund] Transaction trouvée pour remboursement:', {
        transactionId: latestTransaction.id_transaction,
        amount: latestTransaction.montant,
        date: latestTransaction.createdAt
      });

      // 2. Effectuer le remboursement via Kkiapay
      const refundResult = await KkiapayService.refundTransaction({
        transactionId: latestTransaction.id_transaction,
        amount: requestData.amount,
        reason: requestData.reason,
        userEmail: '', // TODO: Récupérer l'email utilisateur
        vaultId: requestData.vaultId
      });

      if (refundResult.success) {
        console.log('✅ [KkiapayRefund] Remboursement Kkiapay réussi:', refundResult.refundId);
        
        // 3. Mettre à jour la transaction originale
        await updateDoc(doc(db, 'transactions', latestTransaction.id), {
          status: 'refunded',
          refundId: refundResult.refundId,
          refundedAt: Timestamp.fromDate(new Date()),
          refundReason: requestData.reason
        });

        // 4. Créer une nouvelle transaction de remboursement
        await addDoc(collection(db, 'transactions'), {
          createdAt: Timestamp.fromDate(new Date()),
          id_transaction: refundResult.refundId || `refund_${requestId}`,
          montant: -requestData.amount, // Négatif pour un remboursement
          paymentMethod: 'Remboursement Kkiapay',
          status: 'completed',
          type: 'Remboursement',
          userId: requestData.userId,
          vaultId: requestData.vaultId,
          reference: `Remboursement Kkiapay - ${requestData.reason}`,
          withdrawalRequestId: requestId,
          originalTransactionId: latestTransaction.id
        });

        // 5. Finaliser la demande de retrait
        await updateDoc(doc(db, 'withdrawalRequests', requestId), {
          status: 'completed',
          processedAt: Timestamp.fromDate(new Date()),
          refundMethod: 'kkiapay',
          refundId: refundResult.refundId
        });

        console.log('✅ [KkiapayRefund] Processus de remboursement Kkiapay terminé avec succès');

      } else {
        console.error('❌ [KkiapayRefund] Échec du remboursement Kkiapay:', refundResult.error);
        
        // En cas d'échec, fallback vers traitement standard
        console.log('🔄 [KkiapayRefund] Fallback vers traitement standard');
        await processStandardWithdrawal(requestData, requestId);
      }
      
    } catch (error) {
      console.error('❌ [KkiapayRefund] Erreur lors du remboursement Kkiapay:', error);
      
      // En cas d'erreur, fallback vers traitement standard
      console.log('🔄 [KkiapayRefund] Fallback vers traitement standard après erreur');
      await processStandardWithdrawal(requestData, requestId);
    }
  };

  // Traitement standard (pour objectif précis)
  const processStandardWithdrawal = async (requestData: WithdrawalRequest, requestId: string): Promise<void> => {
    try {
      console.log('📝 [StandardWithdrawal] Mise à jour des transactions...');
      
      // Mettre à jour la transaction existante
      if (requestData.transactionId) {
        await updateDoc(doc(db, 'transactions', requestData.transactionId), {
          status: 'completed',
          paymentMethod: 'Retrait approuvé',
          reference: `Retrait approuvé par tiers de confiance - ${requestData.reason}`,
          updatedAt: Timestamp.fromDate(new Date())
        });
      } else {
        // Fallback: créer une nouvelle transaction si l'ID n'existe pas
        await addDoc(collection(db, 'transactions'), {
          createdAt: Timestamp.fromDate(new Date()),
          id_transaction: `withdrawal_${requestId}`,
          montant: -requestData.amount, // Négatif pour un retrait
          paymentMethod: 'Retrait approuvé',
          status: 'completed',
          type: 'Retrait',
          userId: requestData.userId,
          vaultId: requestData.vaultId,
          reference: `Retrait approuvé par tiers de confiance - ${requestData.reason}`,
          withdrawalRequestId: requestId
        });
      }

      // Finaliser la demande de retrait
      await updateDoc(doc(db, 'withdrawalRequests', requestId), {
        status: 'completed',
        processedAt: Timestamp.fromDate(new Date())
      });

      console.log('✅ [StandardWithdrawal] Retrait standard traité avec succès');

    } catch (error) {
      console.error('❌ [StandardWithdrawal] Erreur lors du traitement standard:', error);
      throw error;
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

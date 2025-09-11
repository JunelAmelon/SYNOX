import { useAuth } from './useAuth';
import { VaultNotificationData, TrustedPartyNotificationData } from '../lib/emailService';

// Hook pour gérer les notifications par email
export const useEmailNotifications = () => {
  const { currentUser } = useAuth();

  // Envoyer une notification de création de coffre
  const sendVaultCreatedNotification = async (vaultData: {
    name: string;
    amount: number;
    targetAmount?: number;
  }) => {
    if (!currentUser?.email) return false;

    const notificationData: VaultNotificationData = {
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      vaultName: vaultData.name,
      amount: vaultData.amount,
      targetAmount: vaultData.targetAmount,
      action: 'created',
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'vault_created',
          email: currentUser.email,
          data: notificationData,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur envoi notification création coffre:', error);
      return false;
    }
  };

  // Envoyer une notification d'objectif atteint
  const sendGoalReachedNotification = async (vaultData: {
    name: string;
    amount: number;
    targetAmount: number;
  }) => {
    if (!currentUser?.email) return false;

    const notificationData: VaultNotificationData = {
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      vaultName: vaultData.name,
      amount: vaultData.amount,
      targetAmount: vaultData.targetAmount,
      action: 'goal_reached',
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'goal_reached',
          email: currentUser.email,
          data: notificationData,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur envoi notification objectif atteint:', error);
      return false;
    }
  };

  // Envoyer une notification de dépôt
  const sendDepositNotification = async (vaultData: {
    name: string;
    amount: number;
    targetAmount?: number;
  }) => {
    if (!currentUser?.email) return false;

    const notificationData: VaultNotificationData = {
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      vaultName: vaultData.name,
      amount: vaultData.amount,
      targetAmount: vaultData.targetAmount,
      action: 'deposit',
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'deposit',
          email: currentUser.email,
          data: notificationData,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur envoi notification dépôt:', error);
      return false;
    }
  };

  // Envoyer une notification de coffre verrouillé
  const sendVaultLockedNotification = async (vaultData: {
    name: string;
    amount: number;
    targetAmount?: number;
  }) => {
    if (!currentUser?.email) return false;

    const notificationData: VaultNotificationData = {
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      vaultName: vaultData.name,
      amount: vaultData.amount,
      targetAmount: vaultData.targetAmount,
      action: 'locked',
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'vault_locked',
          email: currentUser.email,
          data: notificationData,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur envoi notification verrouillage:', error);
      return false;
    }
  };

  // Envoyer une demande d'approbation aux tiers de confiance
  const sendApprovalRequestNotification = async (
    trustedPartyEmail: string,
    trustedPartyName: string,
    vaultData: {
      name: string;
      amount: number;
    },
    approvalUrl?: string
  ) => {
    if (!currentUser?.email) return false;

    const notificationData: TrustedPartyNotificationData = {
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      trustedPartyName,
      vaultName: vaultData.name,
      amount: vaultData.amount,
      action: 'approval_request',
      approvalUrl,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'approval_request',
          email: trustedPartyEmail,
          data: notificationData,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur envoi demande approbation:', error);
      return false;
    }
  };

  return {
    sendVaultCreatedNotification,
    sendGoalReachedNotification,
    sendDepositNotification,
    sendVaultLockedNotification,
    sendApprovalRequestNotification,
  };
};

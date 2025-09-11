import { useAuth } from './useAuth';
import { generateToken } from '../firebase/firebase';
import { sendPushNotification, VaultPushNotification, TrustedPartyPushNotification } from '../api/push-notifications';

export const usePushNotifications = () => {
  const { currentUser } = useAuth();

  // Obtenir le token FCM de l'utilisateur actuel
  const getUserToken = async (): Promise<string | null> => {
    try {
      const token = await generateToken();
      if (token && currentUser) {
        // Optionnel: Sauvegarder le token en base de données pour l'utilisateur
        // await saveUserToken(currentUser.uid, token);
      }
      return token;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token FCM:', error);
      return null;
    }
  };

  // Envoyer une notification de création de coffre
  const sendVaultCreatedNotification = async (vaultData: {
    name: string;
    targetAmount?: number;
  }): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const token = await getUserToken();
      if (!token) return false;

      const notification: VaultPushNotification = {
        title: '🏦 Nouveau coffre créé !',
        body: `Votre coffre "${vaultData.name}" a été créé avec succès${vaultData.targetAmount ? ` avec un objectif de ${vaultData.targetAmount}€` : ''}.`,
        icon: '/logo-noir.png',
        vaultId: '',
        vaultName: vaultData.name,
        targetAmount: vaultData.targetAmount,
        action: 'vault_created',
        data: {
          type: 'vault_created',
          vaultName: vaultData.name,
          clickAction: '/vaults'
        }
      };

      await sendPushNotification('vault_notification', token, notification);
      return true;
    } catch (error) {
      console.error('Erreur envoi notification push création coffre:', error);
      return false;
    }
  };

  // Envoyer une notification d'objectif atteint
  const sendGoalReachedNotification = async (vaultData: {
    name: string;
    amount: number;
  }): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const token = await getUserToken();
      if (!token) return false;

      const notification: VaultPushNotification = {
        title: '🎉 Objectif atteint !',
        body: `Félicitations ! Votre coffre "${vaultData.name}" a atteint son objectif de ${vaultData.amount}€.`,
        icon: '/logo-noir.png',
        vaultId: '',
        vaultName: vaultData.name,
        amount: vaultData.amount,
        action: 'goal_reached',
        data: {
          type: 'goal_reached',
          vaultName: vaultData.name,
          clickAction: '/vaults'
        }
      };

      await sendPushNotification('vault_notification', token, notification);
      return true;
    } catch (error) {
      console.error('Erreur envoi notification push objectif atteint:', error);
      return false;
    }
  };

  // Envoyer une notification de dépôt
  const sendDepositNotification = async (vaultData: {
    name: string;
    amount: number;
  }): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const token = await getUserToken();
      if (!token) return false;

      const notification: VaultPushNotification = {
        title: '💰 Dépôt effectué',
        body: `${vaultData.amount}€ ont été ajoutés à votre coffre "${vaultData.name}".`,
        icon: '/logo-noir.png',
        vaultId: '',
        vaultName: vaultData.name,
        amount: vaultData.amount,
        action: 'deposit',
        data: {
          type: 'deposit',
          vaultName: vaultData.name,
          clickAction: '/vaults'
        }
      };

      await sendPushNotification('vault_notification', token, notification);
      return true;
    } catch (error) {
      console.error('Erreur envoi notification push dépôt:', error);
      return false;
    }
  };

  // Envoyer une notification de coffre verrouillé
  const sendVaultLockedNotification = async (vaultData: {
    name: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const token = await getUserToken();
      if (!token) return false;

      const notification: VaultPushNotification = {
        title: '🔒 Coffre verrouillé',
        body: `Votre coffre "${vaultData.name}" a été verrouillé avec succès.`,
        icon: '/logo-noir.png',
        vaultId: '',
        vaultName: vaultData.name,
        action: 'vault_locked',
        data: {
          type: 'vault_locked',
          vaultName: vaultData.name,
          clickAction: '/vaults'
        }
      };

      await sendPushNotification('vault_notification', token, notification);
      return true;
    } catch (error) {
      console.error('Erreur envoi notification push verrouillage:', error);
      return false;
    }
  };

  // Envoyer une notification de coffre déverrouillé
  const sendVaultUnlockedNotification = async (vaultData: {
    name: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const token = await getUserToken();
      if (!token) return false;

      const notification: VaultPushNotification = {
        title: '🔓 Coffre déverrouillé',
        body: `Votre coffre "${vaultData.name}" a été déverrouillé.`,
        icon: '/logo-noir.png',
        vaultId: '',
        vaultName: vaultData.name,
        action: 'vault_unlocked',
        data: {
          type: 'vault_unlocked',
          vaultName: vaultData.name,
          clickAction: '/vaults'
        }
      };

      await sendPushNotification('vault_notification', token, notification);
      return true;
    } catch (error) {
      console.error('Erreur envoi notification push déverrouillage:', error);
      return false;
    }
  };

  // Envoyer une demande d'approbation à un tiers de confiance
  const sendApprovalRequestNotification = async (
    trustedPartyToken: string,
    vaultData: {
      id: string;
      name: string;
    },
    requesterName: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const notification: TrustedPartyPushNotification = {
        title: '🤝 Demande d\'approbation',
        body: `${requesterName} demande votre approbation pour accéder au coffre "${vaultData.name}".`,
        icon: '/logo-noir.png',
        vaultId: vaultData.id,
        vaultName: vaultData.name,
        requesterName,
        action: 'approval_request',
        data: {
          type: 'approval_request',
          vaultName: vaultData.name,
          vaultId: vaultData.id,
          requesterName,
          clickAction: '/trusted-parties'
        }
      };

      await sendPushNotification('trusted_party_notification', trustedPartyToken, notification);
      return true;
    } catch (error) {
      console.error('Erreur envoi demande approbation push:', error);
      return false;
    }
  };

  return {
    getUserToken,
    sendVaultCreatedNotification,
    sendGoalReachedNotification,
    sendDepositNotification,
    sendVaultLockedNotification,
    sendVaultUnlockedNotification,
    sendApprovalRequestNotification
  };
};

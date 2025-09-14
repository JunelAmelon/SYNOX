import { adminMessaging } from '../firebase/admin';
import type { Message } from 'firebase-admin/messaging';

// Types pour les notifications push
export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  data?: Record<string, string>;
  clickAction?: string;
}

export interface VaultPushNotification extends PushNotificationData {
  vaultId: string;
  vaultName: string;
  amount?: number;
  targetAmount?: number;
  action: 'vault_created' | 'goal_reached' | 'deposit' | 'vault_locked' | 'vault_unlocked';
}

export interface TrustedPartyPushNotification extends PushNotificationData {
  vaultId?: string;
  vaultName?: string;
  requesterName: string;
  trustedPartyName?: string;
  action: 'approval_request' | 'approval_granted' | 'approval_denied' | 'trusted_party_added' | 'trusted_party_removed';
}

// Interface pour les requêtes API
interface PushNotificationRequest {
  type: 'vault_notification' | 'trusted_party_notification';
  tokens: string | string[];
  notification: VaultPushNotification | TrustedPartyPushNotification;
}

// Service pour l'envoi de notifications push
export class PushNotificationService {
  
  // Envoyer une notification de création de coffre
  static async sendVaultCreatedNotification(token: string, vaultName: string, targetAmount?: number): Promise<boolean> {
    const notification: VaultPushNotification = {
      title: '🏦 Nouveau coffre créé !',
      body: `Votre coffre "${vaultName}" a été créé avec succès${targetAmount ? ` avec un objectif de ${targetAmount}€` : ''}.`,
      icon: '/logo-noir.png',
      vaultId: '',
      vaultName,
      targetAmount,
      action: 'vault_created',
      data: {
        type: 'vault_created',
        vaultName,
        clickAction: '/vaults'
      }
    };

    return this.sendNotification(token, notification);
  }

  // Envoyer une notification d'objectif atteint
  static async sendGoalReachedNotification(token: string, vaultName: string, amount: number): Promise<boolean> {
    const notification: VaultPushNotification = {
      title: '🎉 Objectif atteint !',
      body: `Félicitations ! Votre coffre "${vaultName}" a atteint son objectif de ${amount}€.`,
      icon: '/logo-noir.png',
      vaultId: '',
      vaultName,
      amount,
      action: 'goal_reached',
      data: {
        type: 'goal_reached',
        vaultName,
        clickAction: '/vaults'
      }
    };

    return this.sendNotification(token, notification);
  }

  // Envoyer une notification de dépôt
  static async sendDepositNotification(token: string, vaultName: string, amount: number): Promise<boolean> {
    const notification: VaultPushNotification = {
      title: '💰 Dépôt effectué',
      body: `${amount}€ ont été ajoutés à votre coffre "${vaultName}".`,
      icon: '/logo-noir.png',
      vaultId: '',
      vaultName,
      amount,
      action: 'deposit',
      data: {
        type: 'deposit',
        vaultName,
        clickAction: '/vaults'
      }
    };

    return this.sendNotification(token, notification);
  }

  // Envoyer une notification de coffre verrouillé
  static async sendVaultLockedNotification(token: string, vaultName: string): Promise<boolean> {
    const notification: VaultPushNotification = {
      title: '🔒 Coffre verrouillé',
      body: `Votre coffre "${vaultName}" a été verrouillé avec succès.`,
      icon: '/logo-noir.png',
      vaultId: '',
      vaultName,
      action: 'vault_locked',
      data: {
        type: 'vault_locked',
        vaultName,
        clickAction: '/vaults'
      }
    };

    return this.sendNotification(token, notification);
  }

  // Envoyer une notification de coffre déverrouillé
  static async sendVaultUnlockedNotification(token: string, vaultName: string): Promise<boolean> {
    const notification: VaultPushNotification = {
      title: '🔓 Coffre déverrouillé',
      body: `Votre coffre "${vaultName}" a été déverrouillé.`,
      icon: '/logo-noir.png',
      vaultId: '',
      vaultName,
      action: 'vault_unlocked',
      data: {
        type: 'vault_unlocked',
        vaultName,
        clickAction: '/vaults'
      }
    };

    return this.sendNotification(token, notification);
  }

  // Envoyer une demande d'approbation à un tiers de confiance
  static async sendApprovalRequestNotification(
    token: string, 
    vaultName: string, 
    requesterName: string,
    vaultId: string
  ): Promise<boolean> {
    const notification: TrustedPartyPushNotification = {
      title: '🤝 Demande d\'approbation',
      body: `${requesterName} demande votre approbation pour accéder au coffre "${vaultName}".`,
      icon: '/logo-noir.png',
      vaultId,
      vaultName,
      requesterName,
      action: 'approval_request',
      data: {
        type: 'approval_request',
        vaultName,
        vaultId,
        requesterName,
        clickAction: '/trusted-parties'
      }
    };

    return this.sendNotification(token, notification);
  }

  // Envoyer une notification d'ajout comme tiers de confiance
  static async sendTrustedPartyAddedNotification(
    token: string,
    requesterName: string,
    trustedPartyName: string
  ): Promise<boolean> {
    const notification: TrustedPartyPushNotification = {
      title: '🤝 Vous êtes maintenant un tiers de confiance',
      body: `${requesterName} vous a ajouté comme tiers de confiance sur SYNOX. Vous pouvez maintenant l'aider à gérer ses coffres d'épargne.`,
      icon: '/logo-noir.png',
      requesterName,
      trustedPartyName,
      action: 'trusted_party_added',
      data: {
        type: 'trusted_party_added',
        requesterName,
        trustedPartyName,
        clickAction: '/trusted-parties'
      }
    };

    return this.sendNotification(token, notification);
  }

  // Envoyer une notification de suppression comme tiers de confiance
  static async sendTrustedPartyRemovedNotification(
    token: string,
    requesterName: string,
    trustedPartyName: string
  ): Promise<boolean> {
    const notification: TrustedPartyPushNotification = {
      title: '🚫 Accès tiers de confiance retiré',
      body: `${requesterName} a retiré votre accès comme tiers de confiance sur SYNOX.`,
      icon: '/logo-noir.png',
      requesterName,
      trustedPartyName,
      action: 'trusted_party_removed',
      data: {
        type: 'trusted_party_removed',
        requesterName,
        trustedPartyName,
        clickAction: '/trusted-parties'
      }
    };

    return this.sendNotification(token, notification);
  }

  // Méthode générique pour envoyer une notification
  private static async sendNotification(token: string, notificationData: PushNotificationData): Promise<boolean> {
    try {
      const message: Message = {
        token,
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          imageUrl: notificationData.image,
        },
        data: notificationData.data || {},
        webpush: {
          notification: {
            title: notificationData.title,
            body: notificationData.body,
            icon: notificationData.icon || '/logo-noir.png',
            badge: notificationData.badge || '/logo-noir.png',
            image: notificationData.image,
            requireInteraction: true,
            actions: [
              {
                action: 'open',
                title: 'Ouvrir SYNOX'
              },
              {
                action: 'dismiss',
                title: 'Ignorer'
              }
            ]
          },
          fcmOptions: {
            link: notificationData.clickAction || '/'
          }
        }
      };

      const response = await adminMessaging.send(message);
      console.log('Notification push envoyée avec succès:', response);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification push:', error);
      return false;
    }
  }

  // Envoyer des notifications à plusieurs tokens
  static async sendMulticastNotification(tokens: string[], notificationData: PushNotificationData): Promise<{ successCount: number; failureCount: number; responses: any[] }> {
    try {
      const message = {
        tokens,
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          imageUrl: notificationData.image,
        },
        data: notificationData.data || {},
        webpush: {
          notification: {
            title: notificationData.title,
            body: notificationData.body,
            icon: notificationData.icon || '/logo-noir.png',
            badge: notificationData.badge || '/logo-noir.png',
            image: notificationData.image,
            requireInteraction: true,
          },
          fcmOptions: {
            link: notificationData.clickAction || '/'
          }
        }
      };

      const response = await adminMessaging.sendEachForMulticast(message);
      console.log('Notifications multicast envoyées:', response);
      
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications multicast:', error);
      return {
        successCount: 0,
        failureCount: tokens.length,
        responses: []
      };
    }
  }
}

// Fonction utilitaire pour envoyer des notifications push depuis les hooks
export async function sendPushNotification(
  type: PushNotificationRequest['type'],
  tokens: string | string[],
  notification: VaultPushNotification | TrustedPartyPushNotification
) {
  try {
    const response = await fetch('/api/push-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, tokens, notification }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification push:', error);
    throw error;
  }
}
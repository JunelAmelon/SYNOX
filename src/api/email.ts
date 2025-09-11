import { emailService, VaultNotificationData, TrustedPartyNotificationData } from '../lib/emailService';

// Types pour les requêtes API
interface EmailRequest {
  type: 'vault_created' | 'goal_reached' | 'deposit' | 'approval_request' | 'vault_locked';
  email: string;
  data: VaultNotificationData | TrustedPartyNotificationData;
}

interface ApiRequest {
  method: string;
  body: EmailRequest;
}

interface ApiResponse {
  status: (code: number) => { json: (data: { error?: string; success?: boolean; message?: string }) => void };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { type, email, data }: EmailRequest = req.body;

    if (!type || !email || !data) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    let success = false;

    switch (type) {
      case 'vault_created':
        success = await emailService.sendVaultCreatedNotification(email, data as VaultNotificationData);
        break;
      
      case 'goal_reached':
        success = await emailService.sendGoalReachedNotification(email, data as VaultNotificationData);
        break;
      
      case 'deposit':
        success = await emailService.sendDepositNotification(email, data as VaultNotificationData);
        break;
      
      case 'approval_request':
        success = await emailService.sendApprovalRequestNotification(email, data as TrustedPartyNotificationData);
        break;
      
      case 'vault_locked':
        success = await emailService.sendVaultLockedNotification(email, data as VaultNotificationData);
        break;
      
      default:
        return res.status(400).json({ error: 'Type d\'email non supporté' });
    }

    if (success) {
      res.status(200).json({ message: 'Email envoyé avec succès' });
    } else {
      res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
    }
  } catch (error) {
    console.error('Erreur API email:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Fonction utilitaire pour envoyer des emails depuis les hooks
export async function sendNotificationEmail(
  type: EmailRequest['type'],
  email: string,
  data: VaultNotificationData | TrustedPartyNotificationData
) {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, email, data }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

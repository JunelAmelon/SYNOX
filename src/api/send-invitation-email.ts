import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Template pour invitation de tiers de confiance
function getTrustedPartyInvitationTemplate(data: {
  inviterName: string;
  trustedPartyName: string;
  permissions: string[];
  acceptUrl: string;
  expiryDate: string;
}): string {
  const permissionLabels: Record<string, string> = {
    view_vaults: 'Voir les coffres',
    manage_vaults: 'Gérer les coffres',
    emergency_access: 'Accès d\'urgence',
    view_analytics: 'Voir les analyses',
    approve_withdrawals: 'Approuver les retraits'
  };

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation Tiers de Confiance</title>
      <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
          .content { padding: 40px 30px; }
          .invitation-card { background: linear-gradient(135deg, #dbeafe, #bfdbfe); border: 2px solid #3b82f6; border-radius: 16px; padding: 30px; margin: 20px 0; text-align: center; }
          .inviter-info { font-size: 20px; font-weight: bold; color: #1e40af; margin-bottom: 15px; }
          .invitation-text { font-size: 16px; color: #1f2937; margin: 15px 0; }
          .permissions-section { background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .permissions-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; text-align: center; }
          .permissions-list { display: grid; grid-template-columns: 1fr; gap: 10px; }
          .permission-item { background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; display: flex; align-items: center; }
          .permission-icon { width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }
          .accept-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; margin: 30px 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
          .security-notice { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .security-notice h4 { color: #92400e; margin: 0 0 10px 0; }
          .security-notice p { color: #78350f; margin: 0; font-size: 14px; }
          .expiry-info { text-align: center; color: #6b7280; font-size: 14px; margin: 20px 0; }
          .footer { background-color: #1f2937; color: white; padding: 30px; text-align: center; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>🤝 SYNOX</h1>
              <p>Invitation de Tiers de Confiance</p>
          </div>
          
          <div class="content">
              <h2>Bonjour ${data.trustedPartyName} 👋</h2>
              
              <div class="invitation-card">
                  <div class="inviter-info">${data.inviterName}</div>
                  <div class="invitation-text">
                      vous invite à devenir son <strong>tiers de confiance</strong> sur SYNOX
                  </div>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
                      En acceptant, vous l'aiderez à gérer ses coffres d'épargne de manière sécurisée
                  </p>
              </div>

              <div class="permissions-section">
                  <div class="permissions-title">🔐 Permissions qui vous seront accordées</div>
                  <div class="permissions-list">
                      ${data.permissions.map(permission => `
                      <div class="permission-item">
                          <div class="permission-icon">✓</div>
                          <span>${permissionLabels[permission] || permission}</span>
                      </div>
                      `).join('')}
                  </div>
              </div>

              <div class="security-notice">
                  <h4>🛡️ Sécurité et Responsabilité</h4>
                  <p>En tant que tiers de confiance, vous aurez accès à des informations financières sensibles. Cette responsabilité nécessite votre engagement à protéger la confidentialité et à agir dans l'intérêt de ${data.inviterName}.</p>
              </div>

              <div style="text-align: center;">
                  <a href="${data.acceptUrl}" class="accept-button">
                      ✅ Accepter l'invitation
                  </a>
              </div>

              <div class="expiry-info">
                  ⏰ Cette invitation expire le ${new Date(data.expiryDate).toLocaleDateString('fr-FR')} à ${new Date(data.expiryDate).toLocaleTimeString('fr-FR')}
              </div>

              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Si vous ne souhaitez pas accepter cette invitation, vous pouvez simplement ignorer cet email.
              </p>
          </div>
          
          <div class="footer">
              <p><strong>SYNOX</strong> - Épargne collaborative et sécurisée</p>
              <p>La confiance est la base de notre communauté financière.</p>
          </div>
      </div>
  </body>
  </html>
  `;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const {
      inviterName,
      trustedPartyName,
      trustedPartyEmail,
      permissions,
      acceptUrl,
      expiryDate
    } = req.body;

    if (!inviterName || !trustedPartyName || !trustedPartyEmail || !permissions || !acceptUrl) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const transporter = createTransporter();
    const subject = `🤝 Invitation SYNOX - ${inviterName} vous invite comme tiers de confiance`;
    const html = getTrustedPartyInvitationTemplate({
      inviterName,
      trustedPartyName,
      permissions,
      acceptUrl,
      expiryDate
    });

    await transporter.sendMail({
      from: `"SYNOX" <${process.env.SMTP_USER}>`,
      to: trustedPartyEmail,
      subject,
      html,
    });

    res.status(200).json({ success: true, message: 'Email d\'invitation envoyé avec succès' });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'envoi de l\'email',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}

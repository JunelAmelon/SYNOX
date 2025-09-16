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

// Template pour code d'accès après acceptation
function getTrustedPartyAccessCodeTemplate(data: {
  trustedPartyName: string;
  inviterName: string;
  accessCode: string;
  permissions: string[];
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
      <title>Code d'accès SYNOX</title>
      <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
          .content { padding: 40px 30px; }
          .success-message { text-align: center; margin: 20px 0; }
          .success-icon { font-size: 60px; margin-bottom: 20px; }
          .code-card { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 3px solid #10b981; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; }
          .code-title { font-size: 18px; font-weight: bold; color: #065f46; margin-bottom: 20px; }
          .access-code { font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 8px; font-family: 'Courier New', monospace; background-color: white; padding: 20px; border-radius: 12px; border: 2px dashed #10b981; margin: 20px 0; }
          .code-instructions { font-size: 14px; color: #047857; margin-top: 15px; }
          .permissions-recap { background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .permissions-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 15px; }
          .permission-item { background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; margin: 8px 0; display: flex; align-items: center; }
          .permission-icon { width: 16px; height: 16px; background-color: #10b981; border-radius: 50%; margin-right: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; }
          .security-warning { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .security-warning h4 { color: #dc2626; margin: 0 0 10px 0; }
          .security-warning p { color: #991b1b; margin: 0; font-size: 14px; }
          .footer { background-color: #1f2937; color: white; padding: 30px; text-align: center; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>🔐 SYNOX</h1>
              <p>Votre code d'accès est prêt</p>
          </div>
          
          <div class="content">
              <div class="success-message">
                  <div class="success-icon">🎉</div>
                  <h2>Félicitations ${data.trustedPartyName} !</h2>
                  <p>Vous êtes maintenant le tiers de confiance de <strong>${data.inviterName}</strong></p>
              </div>

              <div class="code-card">
                  <div class="code-title">🔑 Votre Code d'Accès Unique</div>
                  <div class="access-code">${data.accessCode}</div>
                  <div class="code-instructions">
                      Conservez précieusement ce code de 12 chiffres.<br>
                      Il vous sera demandé pour accéder aux fonctionnalités de tiers de confiance.
                  </div>
              </div>

              <div class="permissions-recap">
                  <div class="permissions-title">📋 Vos permissions</div>
                  ${data.permissions.map(permission => `
                  <div class="permission-item">
                      <div class="permission-icon">✓</div>
                      <span>${permissionLabels[permission] || permission}</span>
                  </div>
                  `).join('')}
              </div>

              <div class="security-warning">
                  <h4>🚨 Important - Sécurité</h4>
                  <p>
                      • Ne partagez jamais votre code d'accès avec qui que ce soit<br>
                      • ${data.inviterName} ne vous demandera jamais ce code par email ou téléphone<br>
                      • En cas de perte, contactez immédiatement le support SYNOX<br>
                      • Utilisez vos permissions de manière responsable et éthique
                  </p>
              </div>

              <p style="text-align: center; color: #6b7280;">
                  Vous pouvez maintenant vous connecter à SYNOX et commencer à aider ${data.inviterName} dans la gestion de ses épargnes.
              </p>
          </div>
          
          <div class="footer">
              <p><strong>SYNOX</strong> - Épargne collaborative et sécurisée</p>
              <p>Merci de faire partie de notre communauté de confiance.</p>
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
      trustedPartyEmail,
      trustedPartyName,
      inviterName,
      accessCode,
      permissions
    } = req.body;

    if (!trustedPartyEmail || !trustedPartyName || !inviterName || !accessCode || !permissions) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const transporter = createTransporter();
    const subject = `🔐 Votre code d'accès SYNOX`;
    const html = getTrustedPartyAccessCodeTemplate({
      trustedPartyName,
      inviterName,
      accessCode,
      permissions
    });

    await transporter.sendMail({
      from: `"SYNOX" <${process.env.SMTP_USER}>`,
      to: trustedPartyEmail,
      subject,
      html,
    });

    res.status(200).json({ success: true, message: 'Email de code d\'accès envoyé avec succès' });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de code d\'accès:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'envoi de l\'email',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}

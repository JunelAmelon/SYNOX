import nodemailer from 'nodemailer';

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true pour 465, false pour les autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Types pour les emails
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface VaultNotificationData {
  userName: string;
  vaultName: string;
  amount: number;
  targetAmount?: number;
  action: 'created' | 'deposit' | 'withdrawal' | 'goal_reached' | 'locked' | 'unlocked';
  date: string;
}

export interface TrustedPartyNotificationData {
  userName: string;
  trustedPartyName: string;
  vaultName: string;
  amount: number;
  action: 'approval_request' | 'approved' | 'rejected';
  approvalUrl?: string;
  date: string;
}

// Service d'envoi d'emails
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = createTransporter();
  }

  // Méthode générique pour envoyer un email
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"SYNOX" <${process.env.SMTP_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      console.log('Email envoyé:', info.messageId);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  // Notification de création de coffre
  async sendVaultCreatedNotification(email: string, data: VaultNotificationData): Promise<boolean> {
    const subject = `🏦 Nouveau coffre créé - ${data.vaultName}`;
    const html = this.getVaultCreatedTemplate(data);
    
    return this.sendEmail({ to: email, subject, html });
  }

  // Notification d'objectif atteint
  async sendGoalReachedNotification(email: string, data: VaultNotificationData): Promise<boolean> {
    const subject = `🎉 Objectif atteint - ${data.vaultName}`;
    const html = this.getGoalReachedTemplate(data);
    
    return this.sendEmail({ to: email, subject, html });
  }

  // Notification de dépôt
  async sendDepositNotification(email: string, data: VaultNotificationData): Promise<boolean> {
    const subject = `💰 Nouveau dépôt - ${data.vaultName}`;
    const html = this.getDepositTemplate(data);
    
    return this.sendEmail({ to: email, subject, html });
  }

  // Notification de demande d'approbation pour tiers de confiance
  async sendApprovalRequestNotification(email: string, data: TrustedPartyNotificationData): Promise<boolean> {
    const subject = `🔐 Demande d'approbation - ${data.vaultName}`;
    const html = this.getApprovalRequestTemplate(data);
    
    return this.sendEmail({ to: email, subject, html });
  }

  // Notification de coffre verrouillé
  async sendVaultLockedNotification(email: string, data: VaultNotificationData): Promise<boolean> {
    const subject = `🔒 Coffre verrouillé - ${data.vaultName}`;
    const html = this.getVaultLockedTemplate(data);
    
    return this.sendEmail({ to: email, subject, html });
  }

  // Template pour création de coffre
  private getVaultCreatedTemplate(data: VaultNotificationData): string {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau coffre créé</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
            .content { padding: 40px 30px; }
            .vault-card { background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 16px; padding: 30px; margin: 20px 0; text-align: center; color: white; }
            .vault-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .vault-amount { font-size: 32px; font-weight: bold; margin: 20px 0; }
            .vault-target { font-size: 16px; opacity: 0.9; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .info-item { text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 12px; }
            .info-label { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
            .info-value { font-size: 18px; font-weight: bold; color: #1f2937; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #1f2937; color: white; padding: 30px; text-align: center; }
            .footer p { margin: 5px 0; opacity: 0.8; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏦 SYNOX</h1>
                <p>Votre nouveau coffre d'épargne est prêt !</p>
            </div>
            
            <div class="content">
                <h2>Bonjour ${data.userName} 👋</h2>
                <p>Félicitations ! Votre nouveau coffre d'épargne a été créé avec succès.</p>
                
                <div class="vault-card">
                    <div class="vault-name">${data.vaultName}</div>
                    <div class="vault-amount">${data.amount.toLocaleString('fr-FR')} €</div>
                    ${data.targetAmount ? `<div class="vault-target">Objectif : ${data.targetAmount.toLocaleString('fr-FR')} €</div>` : ''}
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Date de création</div>
                        <div class="info-value">${new Date(data.date).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Statut</div>
                        <div class="info-value">Actif</div>
                    </div>
                </div>
                
                <p>Votre coffre est maintenant actif et prêt à recevoir vos épargnes. Commencez dès maintenant à construire votre avenir financier !</p>
                
                <center>
                    <a href="#" class="cta-button">Voir mon coffre</a>
                </center>
            </div>
            
            <div class="footer">
                <p><strong>SYNOX</strong> - Votre partenaire d'épargne intelligente</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Template pour objectif atteint
  private getGoalReachedTemplate(data: VaultNotificationData): string {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Objectif atteint !</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
            .content { padding: 40px 30px; }
            .celebration { text-align: center; margin: 30px 0; }
            .celebration-emoji { font-size: 80px; margin-bottom: 20px; }
            .achievement-card { background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; padding: 30px; margin: 20px 0; text-align: center; color: white; }
            .vault-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .achievement-amount { font-size: 36px; font-weight: bold; margin: 20px 0; }
            .progress-bar { background-color: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; margin: 20px 0; overflow: hidden; }
            .progress-fill { background-color: white; height: 100%; width: 100%; border-radius: 4px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #1f2937; color: white; padding: 30px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 SYNOX</h1>
                <p>Objectif atteint avec succès !</p>
            </div>
            
            <div class="content">
                <div class="celebration">
                    <div class="celebration-emoji">🎊</div>
                    <h2>Félicitations ${data.userName} !</h2>
                    <p>Vous avez atteint votre objectif d'épargne pour <strong>${data.vaultName}</strong> !</p>
                </div>
                
                <div class="achievement-card">
                    <div class="vault-name">${data.vaultName}</div>
                    <div class="achievement-amount">${data.amount.toLocaleString('fr-FR')} €</div>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <p>Objectif de ${data.targetAmount?.toLocaleString('fr-FR')} € atteint !</p>
                </div>
                
                <p>Bravo pour votre discipline et votre persévérance ! Vous pouvez maintenant utiliser vos économies pour réaliser votre projet ou continuer à épargner.</p>
                
                <center>
                    <a href="#" class="cta-button">Gérer mon coffre</a>
                </center>
            </div>
            
            <div class="footer">
                <p><strong>SYNOX</strong> - Votre partenaire d'épargne intelligente</p>
                <p>Continuez comme ça, vous êtes sur la bonne voie !</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Template pour dépôt
  private getDepositTemplate(data: VaultNotificationData): string {
    const progress = data.targetAmount ? (data.amount / data.targetAmount) * 100 : 0;
    
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau dépôt</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .deposit-card { background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 16px; padding: 30px; margin: 20px 0; text-align: center; color: white; }
            .deposit-amount { font-size: 32px; font-weight: bold; margin: 20px 0; }
            .progress-section { margin: 30px 0; }
            .progress-bar { background-color: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden; margin: 15px 0; }
            .progress-fill { background: linear-gradient(135deg, #3b82f6, #2563eb); height: 100%; border-radius: 6px; transition: width 0.3s ease; }
            .progress-text { display: flex; justify-content: space-between; font-size: 14px; color: #6b7280; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #1f2937; color: white; padding: 30px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💰 SYNOX</h1>
                <p>Nouveau dépôt effectué</p>
            </div>
            
            <div class="content">
                <h2>Bonjour ${data.userName} 👋</h2>
                <p>Votre dépôt a été effectué avec succès dans votre coffre <strong>${data.vaultName}</strong>.</p>
                
                <div class="deposit-card">
                    <p>Montant déposé</p>
                    <div class="deposit-amount">+${data.amount.toLocaleString('fr-FR')} €</div>
                    <p>Le ${new Date(data.date).toLocaleDateString('fr-FR')}</p>
                </div>
                
                ${data.targetAmount ? `
                <div class="progress-section">
                    <h3>Progression vers votre objectif</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>${data.amount.toLocaleString('fr-FR')} €</span>
                        <span>${progress.toFixed(1)}%</span>
                        <span>${data.targetAmount.toLocaleString('fr-FR')} €</span>
                    </div>
                </div>
                ` : ''}
                
                <p>Continuez comme ça ! Chaque dépôt vous rapproche de vos objectifs financiers.</p>
                
                <center>
                    <a href="#" class="cta-button">Voir mon coffre</a>
                </center>
            </div>
            
            <div class="footer">
                <p><strong>SYNOX</strong> - Votre partenaire d'épargne intelligente</p>
                <p>Bravo pour votre régularité dans l'épargne !</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Template pour demande d'approbation
  private getApprovalRequestTemplate(data: TrustedPartyNotificationData): string {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demande d'approbation</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .request-card { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b; border-radius: 16px; padding: 30px; margin: 20px 0; }
            .request-amount { font-size: 28px; font-weight: bold; color: #92400e; text-align: center; margin: 20px 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .info-item { text-align: center; }
            .info-label { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
            .info-value { font-size: 16px; font-weight: bold; color: #1f2937; }
            .action-buttons { text-align: center; margin: 30px 0; }
            .approve-btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 0 10px; }
            .reject-btn { display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 0 10px; }
            .footer { background-color: #1f2937; color: white; padding: 30px; text-align: center; }
            .warning { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0; color: #991b1b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 SYNOX</h1>
                <p>Demande d'approbation de retrait</p>
            </div>
            
            <div class="content">
                <h2>Bonjour ${data.trustedPartyName} 👋</h2>
                <p><strong>${data.userName}</strong> demande votre approbation pour un retrait d'urgence.</p>
                
                <div class="request-card">
                    <h3 style="text-align: center; color: #92400e; margin-top: 0;">Détails de la demande</h3>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Coffre concerné</div>
                            <div class="info-value">${data.vaultName}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Date de demande</div>
                            <div class="info-value">${new Date(data.date).toLocaleDateString('fr-FR')}</div>
                        </div>
                    </div>
                    
                    <div class="request-amount">${data.amount.toLocaleString('fr-FR')} €</div>
                    <p style="text-align: center; color: #6b7280;">Montant demandé</p>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important :</strong> En tant que tiers de confiance, votre approbation est requise pour ce retrait d'urgence. Assurez-vous que cette demande est légitime avant d'approuver.
                </div>
                
                <p>Veuillez examiner cette demande et donner votre réponse :</p>
                
                <div class="action-buttons">
                    ${data.approvalUrl ? `
                    <a href="${data.approvalUrl}?action=approve" class="approve-btn">✅ Approuver</a>
                    <a href="${data.approvalUrl}?action=reject" class="reject-btn">❌ Rejeter</a>
                    ` : `
                    <a href="#" class="approve-btn">✅ Approuver</a>
                    <a href="#" class="reject-btn">❌ Rejeter</a>
                    `}
                </div>
            </div>
            
            <div class="footer">
                <p><strong>SYNOX</strong> - Sécurité et confiance</p>
                <p>Votre rôle de tiers de confiance est essentiel pour la sécurité des épargnes.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Template pour coffre verrouillé
  private getVaultLockedTemplate(data: VaultNotificationData): string {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coffre verrouillé</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #6b7280, #4b5563); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 30px; }
            .lock-card { background: linear-gradient(135deg, #6b7280, #4b5563); border-radius: 16px; padding: 30px; margin: 20px 0; text-align: center; color: white; }
            .lock-icon { font-size: 60px; margin-bottom: 20px; }
            .vault-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .vault-amount { font-size: 32px; font-weight: bold; margin: 20px 0; }
            .info-box { background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #6b7280, #4b5563); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #1f2937; color: white; padding: 30px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 SYNOX</h1>
                <p>Coffre sécurisé et verrouillé</p>
            </div>
            
            <div class="content">
                <h2>Bonjour ${data.userName} 👋</h2>
                <p>Votre coffre <strong>${data.vaultName}</strong> a été verrouillé avec succès pour sécuriser vos économies.</p>
                
                <div class="lock-card">
                    <div class="lock-icon">🔐</div>
                    <div class="vault-name">${data.vaultName}</div>
                    <div class="vault-amount">${data.amount.toLocaleString('fr-FR')} €</div>
                    <p>Coffre sécurisé</p>
                </div>
                
                <div class="info-box">
                    <h3>ℹ️ Informations importantes</h3>
                    <ul style="text-align: left; color: #4b5563;">
                        <li>Votre argent est maintenant sécurisé et protégé</li>
                        <li>Les retraits nécessiteront l'approbation de vos tiers de confiance</li>
                        <li>Cette mesure vous aide à respecter vos objectifs d'épargne</li>
                        <li>Vous pouvez toujours consulter votre coffre à tout moment</li>
                    </ul>
                </div>
                
                <p>Le verrouillage de votre coffre est une excellente décision pour sécuriser vos économies et vous aider à atteindre vos objectifs financiers.</p>
                
                <center>
                    <a href="#" class="cta-button">Voir mon coffre</a>
                </center>
            </div>
            
            <div class="footer">
                <p><strong>SYNOX</strong> - Votre partenaire d'épargne intelligente</p>
                <p>Vos économies sont en sécurité avec nous.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

// Instance singleton du service email
export const emailService = new EmailService();

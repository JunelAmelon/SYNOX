# Configuration EmailJS pour SYNOX

## 1. Créer un compte EmailJS

1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Créez un compte gratuit (100 emails/mois inclus)
3. Confirmez votre email

## 2. Configurer le service email

1. Dans le dashboard EmailJS, cliquez sur **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez votre fournisseur email (Gmail, Outlook, etc.)
4. Suivez les instructions pour connecter votre compte email
5. Notez le **Service ID** (ex: `service_synox`)

## 3. Créer les templates d'email

### Template d'Invitation de Tiers de Confiance

**Template ID:** `template_invitation`

**Variables du template:**
- `{{to_name}}` - Nom du destinataire
- `{{from_name}}` - Nom de l'expéditeur
- `{{accept_url}}` - URL d'acceptation
- `{{expiry_date}}` - Date d'expiration
- `{{permissions}}` - Liste des permissions

**Configuration EmailJS requise:**
- **To Email:** `{{user_email}}`
- **Reply To:** `{{reply_to}}`

**Contenu du template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invitation SYNOX</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #f59e0b; margin-bottom: 10px; }
        .invitation-card { background: linear-gradient(135deg, #dbeafe, #bfdbfe); border: 2px solid #3b82f6; border-radius: 16px; padding: 30px; margin: 20px 0; text-align: center; }
        .accept-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🤝 SYNOX</div>
            <h2>Invitation de Tiers de Confiance</h2>
        </div>
        
        <p>Bonjour <strong>{{to_name}}</strong>,</p>
        
        <div class="invitation-card">
            <h3>{{from_name}}</h3>
            <p>vous invite à devenir son <strong>tiers de confiance</strong> sur SYNOX</p>
            <p style="font-size: 14px; color: #666;">
                En acceptant, vous l'aiderez à gérer ses coffres d'épargne de manière sécurisée
            </p>
        </div>
        
        <p><strong>Permissions accordées:</strong> {{permissions}}</p>
        
        <div style="text-align: center;">
            <a href="{{accept_url}}" class="accept-button">
                ✅ Accepter l'invitation
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
            ⏰ Cette invitation expire le {{expiry_date}}
        </p>
        
        <div class="footer">
            <p><strong>SYNOX</strong> - Épargne collaborative et sécurisée</p>
        </div>
    </div>
</body>
</html>
```

### Template 2: Code d'accès
1. Créez un nouveau template
2. **Template ID**: `template_access_code`
3. **Template Name**: `SYNOX - Code d'Accès`

**Variables du template:**
- `{{to_name}}` - Nom du destinataire
- `{{from_name}}` - Nom de l'expéditeur
- `{{access_code}}` - Code d'accès à 12 chiffres
- `{{permissions}}` - Liste des permissions

**Configuration EmailJS requise:**
- **To Email:** `{{user_email}}`
- **Reply To:** `{{reply_to}}`

**Contenu du template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Code d'accès SYNOX</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #10b981; margin-bottom: 10px; }
        .code-card { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 3px solid #10b981; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; }
        .access-code { font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 8px; font-family: 'Courier New', monospace; background-color: white; padding: 20px; border-radius: 12px; border: 2px dashed #10b981; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐 SYNOX</div>
            <h2>Votre code d'accès est prêt</h2>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 60px;">🎉</div>
            <h3>Félicitations {{to_name}} !</h3>
            <p>Vous êtes maintenant le tiers de confiance de <strong>{{from_name}}</strong></p>
        </div>

        <div class="code-card">
            <h3>🔑 Votre Code d'Accès Unique</h3>
            <div class="access-code">{{access_code}}</div>
            <p style="font-size: 14px; color: #047857;">
                Conservez précieusement ce code de 12 chiffres.<br>
                Il vous sera demandé pour accéder aux fonctionnalités de tiers de confiance.
            </p>
        </div>
        
        <p><strong>Vos permissions:</strong> {{permissions}}</p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">🚨 Important - Sécurité</h4>
            <p style="color: #991b1b; margin: 0; font-size: 14px;">
                • Ne partagez jamais votre code d'accès<br>
                • {{from_name}} ne vous demandera jamais ce code par email<br>
                • En cas de perte, contactez le support SYNOX
            </p>
        </div>
        
        <div class="footer">
            <p><strong>SYNOX</strong> - Épargne collaborative et sécurisée</p>
        </div>
    </div>
</body>
</html>
```

### Template 3: Demande d'Approbation de Retrait

**Template ID:** `template_approval`

**Variables du template:**
- `{{to_name}}` - Nom du destinataire
- `{{from_name}}` - Nom de l'expéditeur  
- `{{vault_name}}` - Nom du coffre
- `{{amount}}` - Montant à retirer
- `{{reason}}` - Motif du retrait
- `{{approval_url}}` - URL d'approbation
- `{{request_id}}` - ID de la demande

**Configuration EmailJS requise:**
- **To Email:** `{{user_email}}`
- **Reply To:** `{{reply_to}}`

**Contenu du template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Demande d'approbation SYNOX</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #f59e0b; margin-bottom: 10px; }
        .approval-card { background: linear-gradient(135deg, #fef3c7, #fde68a); border: 3px solid #f59e0b; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; }
        .amount { font-size: 48px; font-weight: bold; color: #d97706; margin: 20px 0; }
        .approve-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .urgent { background-color: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐 SYNOX</div>
            <h2>Demande d'Approbation de Retrait</h2>
        </div>
        
        <p>Bonjour <strong>{{to_name}}</strong>,</p>
        
        <div class="urgent">
            <h3 style="color: #dc2626; margin: 0 0 10px 0;">🚨 Action Requise</h3>
            <p style="color: #991b1b; margin: 0;">
                <strong>{{from_name}}</strong> demande votre approbation pour un retrait de fonds
            </p>
        </div>

        <div class="approval-card">
            <h3>💰 Détails du Retrait</h3>
            <p><strong>Coffre:</strong> {{vault_name}}</p>
            <div class="amount">{{amount}}€</div>
            <p><strong>Motif:</strong> {{reason}}</p>
            <p style="font-size: 14px; color: #92400e;">
                Demande #{{request_id}}
            </p>
        </div>
        
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #1d4ed8; margin: 0 0 10px 0;">ℹ️ Votre rôle de tiers de confiance</h4>
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
                En tant que tiers de confiance, votre approbation est nécessaire pour autoriser ce retrait. 
                Vous devrez saisir votre code d'accès à 12 chiffres pour confirmer.
            </p>
        </div>
        
        <div style="text-align: center;">
            <a href="{{approval_url}}" class="approve-button">
                ✅ Examiner et Approuver
            </a>
        </div>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Sécurité</h4>
            <p style="color: #991b1b; margin: 0; font-size: 14px;">
                • Vérifiez que cette demande est légitime<br>
                • Ne partagez jamais votre code d'accès<br>
                • En cas de doute, contactez directement {{from_name}}
            </p>
        </div>
        
        <div class="footer">
            <p><strong>SYNOX</strong> - Épargne collaborative et sécurisée</p>
        </div>
    </div>
</body>
</html>
```

## 4. Obtenir les clés d'API

1. Allez dans **"Account"** > **"General"**
2. Notez votre **Public Key** (ex: `user_abc123def456`)

## 5. Configurer l'application

Ajoutez ces variables dans votre fichier `.env`:

```env
VITE_EMAILJS_SERVICE_ID=service_synox
VITE_EMAILJS_TEMPLATE_INVITATION=template_invitation
VITE_EMAILJS_TEMPLATE_ACCESS_CODE=template_access_code
VITE_EMAILJS_TEMPLATE_APPROVAL=template_approval
VITE_EMAILJS_PUBLIC_KEY=user_abc123def456
```

## 6. Mettre à jour le service email

Le service a été configuré pour utiliser EmailJS. Il suffit de remplacer les valeurs par défaut par vos vraies clés dans `emailService.ts`.

## 7. Test

Une fois configuré, testez l'envoi d'invitations depuis l'interface SYNOX. Les emails seront envoyés directement depuis le navigateur sans backend !

## Avantages d'EmailJS

- ✅ Pas de backend nécessaire
- ✅ Envoi direct depuis le client
- ✅ Templates HTML riches
- ✅ 100 emails gratuits/mois
- ✅ Support de tous les fournisseurs email
- ✅ Statistiques d'envoi

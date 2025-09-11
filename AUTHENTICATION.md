# 🔐 Système d'Authentification SYNOX

## Vue d'ensemble

Le système d'authentification de SYNOX utilise Firebase Auth avec des fonctionnalités avancées incluant :
- ✅ Inscription/Connexion par email et mot de passe
- ✅ Authentification Google
- ✅ Récupération de mot de passe
- ✅ Authentification à deux facteurs (2FA) optionnelle
- ✅ Validation des emails
- ✅ Gestion des erreurs et états de chargement

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet avec vos clés Firebase :

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Configuration Firebase Console

Dans votre console Firebase :
- Activez Authentication > Sign-in method > Email/Password
- Activez Authentication > Sign-in method > Google
- Configurez les domaines autorisés
- Activez Multi-Factor Authentication si nécessaire

## Utilisation du Hook useAuth

### Import et initialisation

```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { 
    currentUser, 
    loading, 
    error, 
    signup, 
    login, 
    logout,
    resetPassword 
  } = useAuth();
}
```

### Fonctions disponibles

#### 📝 Inscription
```tsx
const handleSignup = async () => {
  try {
    const result = await signup(email, password, {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+229XXXXXXXX'
    });
    
    if (result.success) {
      // Utilisateur créé avec succès
      // Email de vérification envoyé automatiquement
    }
  } catch (error) {
    console.error('Erreur inscription:', error);
  }
};
```

#### 🔑 Connexion
```tsx
const handleLogin = async () => {
  try {
    const result = await login(email, password);
    
    if (result.requiresMFA) {
      // Rediriger vers l'interface 2FA
      setShowMfaInput(true);
    } else if (result.success) {
      // Connexion réussie
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Erreur connexion:', error);
  }
};
```

#### 🔄 Récupération de mot de passe
```tsx
const handlePasswordReset = async () => {
  try {
    await resetPassword(email);
    // Email de réinitialisation envoyé
  } catch (error) {
    console.error('Erreur réinitialisation:', error);
  }
};
```

#### 🔐 Configuration 2FA

**Étape 1 : Enrôler un numéro de téléphone**
```tsx
const setup2FA = async () => {
  try {
    const result = await setupTwoFactor(phoneNumber);
    if (result.success) {
      // Code SMS envoyé, demander à l'utilisateur de le saisir
      setShowCodeInput(true);
    }
  } catch (error) {
    console.error('Erreur 2FA setup:', error);
  }
};
```

**Étape 2 : Vérifier le code et finaliser**
```tsx
const complete2FA = async () => {
  try {
    const result = await completeTwoFactorSetup(verificationCode);
    if (result.success) {
      // 2FA activée avec succès
    }
  } catch (error) {
    console.error('Erreur vérification 2FA:', error);
  }
};
```

#### ✅ Vérification 2FA lors de la connexion
```tsx
const verify2FA = async () => {
  try {
    const result = await verifyTwoFactor(mfaCode);
    if (result.success) {
      // Connexion 2FA réussie
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Erreur vérification 2FA:', error);
  }
};
```

## Structure des données utilisateur

### Firestore Document (`users/{uid}`)
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe", 
  "phone": "+229XXXXXXXX",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "emailVerified": false,
  "twoFactorEnabled": false,
  "provider": "email" // ou "google"
}
```

## Composants intégrés

### LoginForm
- Interface de connexion complète
- Gestion des erreurs en temps réel
- Support 2FA avec interface dédiée
- Modal de récupération de mot de passe
- Connexion Google intégrée

### SignupForm  
- Formulaire d'inscription avec validation
- Vérification des mots de passe
- Validation des champs en temps réel
- Écran de succès avec redirection
- Connexion Google pour nouveaux utilisateurs

## Gestion des erreurs

Le hook `useAuth` gère automatiquement les erreurs courantes :

```tsx
// Erreurs d'authentification
- auth/user-not-found
- auth/wrong-password
- auth/email-already-in-use
- auth/weak-password
- auth/invalid-email

// Erreurs 2FA
- auth/multi-factor-auth-required
- auth/invalid-verification-code
- auth/session-expired
```

## États de chargement

```tsx
const { loading, error } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} />;
}
```

## Sécurité

### Bonnes pratiques implémentées :
- ✅ Validation côté client et serveur
- ✅ Chiffrement des mots de passe par Firebase
- ✅ Tokens JWT sécurisés
- ✅ Vérification d'email obligatoire
- ✅ 2FA optionnelle
- ✅ reCAPTCHA pour la 2FA
- ✅ Gestion des sessions

### Recommandations :
- Utilisez des mots de passe forts (minimum 8 caractères)
- Activez la 2FA pour les comptes sensibles
- Vérifiez toujours l'email avant d'accorder l'accès complet
- Implémentez une politique de mot de passe stricte

## Exemple d'utilisation complète

```tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

function AuthExample() {
  const { 
    currentUser, 
    loading, 
    error, 
    login, 
    logout, 
    signup 
  } = useAuth();

  if (loading) return <div>Chargement...</div>;

  if (!currentUser) {
    return (
      <div>
        <LoginForm onLogin={() => console.log('Connecté!')} />
      </div>
    );
  }

  return (
    <div>
      <h1>Bienvenue {currentUser.displayName}!</h1>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}
```

## Support et dépannage

### Problèmes courants :

1. **Variables d'environnement non chargées**
   - Vérifiez que le fichier `.env` est à la racine
   - Redémarrez le serveur de développement

2. **Erreur reCAPTCHA**
   - Ajoutez `<div id="recaptcha-container"></div>` à votre HTML
   - Vérifiez les domaines autorisés dans Firebase

3. **2FA ne fonctionne pas**
   - Activez Multi-Factor Auth dans Firebase Console
   - Vérifiez le format du numéro de téléphone (+229XXXXXXXX)

4. **Email de vérification non reçu**
   - Vérifiez les spams
   - Configurez les templates d'email dans Firebase

---

**Développé pour SYNOX** - Système d'épargne digitale sécurisée 🏦

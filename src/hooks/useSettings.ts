import { useState } from 'react';
import { useAuth } from './useAuth';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export const useSettings = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mettre à jour le profil utilisateur
  const updateUserProfile = async (profileData: ProfileData): Promise<boolean> => {
    if (!currentUser) {
      setError('Utilisateur non connecté');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Construire le nom d'affichage complet
      const displayName = `${profileData.firstName} ${profileData.lastName}`;

      // Mettre à jour le profil Firebase Auth
      await updateProfile(currentUser, {
        displayName: displayName
      });

      // Mettre à jour les données supplémentaires dans Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        displayName: displayName,
        updatedAt: new Date()
      });

      // Note: L'email ne peut pas être mis à jour directement ici
      // Il faudrait utiliser updateEmail() avec une réauthentification
      if (profileData.email !== currentUser.email) {
        console.warn('La mise à jour de l\'email nécessite une réauthentification séparée');
      }

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil');
      setLoading(false);
      return false;
    }
  };

  // Changer le mot de passe
  const changePassword = async (passwordData: PasswordChangeData): Promise<boolean> => {
    if (!currentUser || !currentUser.email) {
      setError('Utilisateur non connecté');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Créer les credentials pour la réauthentification
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );

      // Réauthentifier l'utilisateur
      await reauthenticateWithCredential(currentUser, credential);

      // Mettre à jour le mot de passe
      await updatePassword(currentUser, passwordData.newPassword);

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Erreur lors du changement de mot de passe:', err);
      
      let errorMessage = 'Erreur lors du changement de mot de passe';
      
      if (err instanceof Error) {
        switch (err.message) {
          case 'auth/wrong-password':
            errorMessage = 'Mot de passe actuel incorrect';
            break;
          case 'auth/weak-password':
            errorMessage = 'Le nouveau mot de passe est trop faible';
            break;
          case 'auth/requires-recent-login':
            errorMessage = 'Veuillez vous reconnecter avant de changer votre mot de passe';
            break;
          default:
            errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Obtenir les données du profil actuel
  const getCurrentProfile = (): ProfileData | null => {
    if (!currentUser) return null;

    const displayName = currentUser.displayName || '';
    const nameParts = displayName.split(' ');
    
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: currentUser.email || '',
      phone: '' // À récupérer depuis Firestore si nécessaire
    };
  };

  // Valider les données du profil
  const validateProfile = (profileData: ProfileData): string[] => {
    const errors: string[] = [];

    if (!profileData.firstName.trim()) {
      errors.push('Le prénom est requis');
    }

    if (!profileData.lastName.trim()) {
      errors.push('Le nom est requis');
    }

    if (!profileData.email.trim()) {
      errors.push('L\'email est requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.push('Format d\'email invalide');
    }

    if (profileData.phone && !/^(\+33|0)[1-9](\d{8})$/.test(profileData.phone.replace(/\s/g, ''))) {
      errors.push('Format de téléphone invalide');
    }

    return errors;
  };

  // Valider les données de changement de mot de passe
  const validatePassword = (passwordData: PasswordChangeData): string[] => {
    const errors: string[] = [];

    if (!passwordData.currentPassword) {
      errors.push('Le mot de passe actuel est requis');
    }

    if (!passwordData.newPassword) {
      errors.push('Le nouveau mot de passe est requis');
    } else if (passwordData.newPassword.length < 6) {
      errors.push('Le nouveau mot de passe doit contenir au moins 6 caractères');
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    return errors;
  };

  // Réinitialiser l'erreur
  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    updateUserProfile,
    changePassword,
    getCurrentProfile,
    validateProfile,
    validatePassword,
    clearError
  };
};

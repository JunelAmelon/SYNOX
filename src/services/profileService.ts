import { db } from '../firebase/firebase';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

const PROFILES_COLLECTION = 'userProfiles';

// Interface pour le profil utilisateur
export interface UserProfile {
  userId: string;
  userName?: string;
  userEmail?: string;
  profileImage?: string | null;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// --- Fonctions CRUD pour les profils --- //

/**
 * Crée un nouveau profil utilisateur dans Firestore.
 */
export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    console.log('🔥 Création du profil pour userId:', userId);
    const profileRef = doc(db, PROFILES_COLLECTION, userId);
    const now = new Date();

    const newProfile: UserProfile = {
      userId,
      userName: profileData.userName || '',
      userEmail: profileData.userEmail || '',
      profileImage: null,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(profileRef, newProfile);
    console.log('✅ Profil créé avec succès dans Firestore');
  } catch (error) {
    console.error('❌ Erreur lors de la création du profil:', error);
    throw error;
  }
};

/**
 * Récupère le profil d'un utilisateur depuis Firestore.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, userId);
    const docSnap = await getDoc(profileRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    throw error;
  }
};

/**
 * Met à jour des informations partielles du profil utilisateur.
 */
export const updateUserProfile = async (userId: string, dataToUpdate: Partial<UserProfile>): Promise<void> => {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, userId);
    await updateDoc(profileRef, {
      ...dataToUpdate,
      updatedAt: new Date(),
    });
    console.log('✅ Profil mis à jour avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

/**
 * Met à jour spécifiquement la photo de profil.
 */
export const updateProfileImage = async (userId: string, imageBase64: string): Promise<void> => {
  try {
    await updateUserProfile(userId, { profileImage: imageBase64 });
    console.log('✅ Photo de profil mise à jour');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la photo:', error);
    throw error;
  }
};

/**
 * Supprime la photo de profil.
 */
export const removeProfileImage = async (userId: string): Promise<void> => {
  try {
    await updateUserProfile(userId, { profileImage: null });
    console.log('✅ Photo de profil supprimée');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la photo:', error);
    throw error;
  }
};

/**
 * Met à jour spécifiquement le nom d'utilisateur.
 */
export const updateUserName = async (userId: string, userName: string): Promise<void> => {
  try {
    await updateUserProfile(userId, { userName });
    console.log('✅ Nom d\'utilisateur mis à jour');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du nom:', error);
    throw error;
  }
};

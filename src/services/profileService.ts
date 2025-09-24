import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export interface UserProfile {
  userId: string;
  profileImage?: string;
  userName?: string;
  userEmail?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Collection name
const PROFILES_COLLECTION = 'userProfiles';

/**
 * Récupérer le profil d'un utilisateur
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, userId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
};

/**
 * Créer un nouveau profil utilisateur
 */
export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    console.log('🔥 Création du profil pour userId:', userId);
    console.log('🔥 Données du profil:', profileData);
    
    const profileRef = doc(db, PROFILES_COLLECTION, userId);
    const now = new Date();
    
    const newProfile: UserProfile = {
      userId,
      ...profileData,
      createdAt: now,
      updatedAt: now,
    };
    
    console.log('🔥 Profil complet à sauvegarder:', newProfile);
    
    await setDoc(profileRef, newProfile);
    console.log('✅ Profil créé avec succès dans Firestore');
  } catch (error) {
    console.error('❌ Erreur lors de la création du profil:', error);
    throw error;
  }
};

/**
 * Mettre à jour le profil d'un utilisateur
 */
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, userId);
    
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await updateDoc(profileRef, updateData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

/**
 * Mettre à jour la photo de profil
 */
export const updateProfileImage = async (userId: string, imageBase64: string): Promise<void> => {
  try {
    console.log('🔥 Mise à jour de la photo pour userId:', userId);
    console.log('🔥 Taille de l\'image (caractères):', imageBase64.length);
    
    await updateUserProfile(userId, { profileImage: imageBase64 });
    console.log('✅ Photo de profil mise à jour avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la photo de profil:', error);
    throw error;
  }
};

/**
 * Supprimer la photo de profil
 */
export const removeProfileImage = async (userId: string): Promise<void> => {
  try {
    await updateUserProfile(userId, { profileImage: '' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo de profil:', error);
    throw error;
  }
};

/**
 * Mettre à jour le nom d'utilisateur
 */
export const updateUserName = async (userId: string, userName: string): Promise<void> => {
  try {
    await updateUserProfile(userId, { userName });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du nom d\'utilisateur:', error);
    throw error;
  }
};

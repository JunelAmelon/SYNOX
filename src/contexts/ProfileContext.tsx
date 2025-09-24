import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getUserProfile, 
  createUserProfile, 
  updateProfileImage, 
  removeProfileImage, 
  updateUserName,
  UserProfile 
} from '../services/profileService';

interface ProfileContextType {
  profileImage: string | null;
  setProfileImage: (image: string | null) => Promise<void>;
  userName: string;
  setUserName: (name: string) => Promise<void>;
  userEmail: string;
  setUserEmail: (email: string) => void;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const [userName, setUserNameState] = useState<string>('');
  const [userEmail, setUserEmailState] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le profil depuis Firebase
  const loadProfile = async () => {
    if (!currentUser) {
      console.log('🔥 Pas d\'utilisateur connecté, arrêt du chargement du profil');
      return;
    }
    
    console.log('🔥 Chargement du profil pour userId:', currentUser.uid);
    setLoading(true);
    setError(null);
    
    try {
      const profile = await getUserProfile(currentUser.uid);
      console.log('🔥 Profil récupéré:', profile);
      
      if (profile) {
        console.log('✅ Profil existant trouvé');
        console.log('🔥 Photo de profil:', profile.profileImage ? 'Présente' : 'Absente');
        setProfileImageState(profile.profileImage || null);
        setUserNameState(profile.userName || '');
        setUserEmailState(profile.userEmail || currentUser.email || '');
      } else {
        console.log('⚠️ Aucun profil existant, création d\'un nouveau profil');
        // Créer un profil par défaut si il n'existe pas
        await createUserProfile(currentUser.uid, {
          userEmail: currentUser.email || '',
          userName: currentUser.displayName || '',
        });
        setUserEmailState(currentUser.email || '');
        setUserNameState(currentUser.displayName || '');
      }
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error('❌ Erreur lors du chargement du profil:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger le profil au montage et quand l'utilisateur change
  useEffect(() => {
    if (currentUser) {
      loadProfile();
    } else {
      // Reset si pas d'utilisateur connecté
      setProfileImageState(null);
      setUserNameState('');
      setUserEmailState('');
    }
  }, [currentUser]);

  // Fonction pour mettre à jour la photo de profil
  const setProfileImage = async (image: string | null) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (image) {
        await updateProfileImage(currentUser.uid, image);
      } else {
        await removeProfileImage(currentUser.uid);
      }
      setProfileImageState(image);
    } catch (err) {
      setError('Erreur lors de la mise à jour de la photo');
      console.error('Erreur lors de la mise à jour de la photo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le nom d'utilisateur
  const setUserName = async (name: string) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await updateUserName(currentUser.uid, name);
      setUserNameState(name);
    } catch (err) {
      setError('Erreur lors de la mise à jour du nom');
      console.error('Erreur lors de la mise à jour du nom:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour l'email (local seulement pour l'instant)
  const setUserEmail = (email: string) => {
    setUserEmailState(email);
  };

  // Fonction pour rafraîchir le profil
  const refreshProfile = async () => {
    await loadProfile();
  };

  const value = {
    profileImage,
    setProfileImage,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    loading,
    error,
    refreshProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

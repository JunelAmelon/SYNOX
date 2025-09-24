import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProfileContextType {
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const [userName, setUserNameState] = useState<string>('Utilisateur SYNOX');
  const [userEmail, setUserEmailState] = useState<string>('user@synox.com');

  // Charger les données depuis le localStorage au démarrage
  useEffect(() => {
    const savedImage = localStorage.getItem('synox_profile_image');
    const savedName = localStorage.getItem('synox_user_name');
    const savedEmail = localStorage.getItem('synox_user_email');

    if (savedImage) {
      setProfileImageState(savedImage);
    }
    if (savedName) {
      setUserNameState(savedName);
    }
    if (savedEmail) {
      setUserEmailState(savedEmail);
    }
  }, []);

  // Fonction pour mettre à jour la photo de profil
  const setProfileImage = (image: string | null) => {
    setProfileImageState(image);
    if (image) {
      localStorage.setItem('synox_profile_image', image);
    } else {
      localStorage.removeItem('synox_profile_image');
    }
  };

  // Fonction pour mettre à jour le nom d'utilisateur
  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('synox_user_name', name);
  };

  // Fonction pour mettre à jour l'email
  const setUserEmail = (email: string) => {
    setUserEmailState(email);
    localStorage.setItem('synox_user_email', email);
  };

  const value = {
    profileImage,
    setProfileImage,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
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

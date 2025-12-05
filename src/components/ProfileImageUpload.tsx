import React, { useRef, useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { Camera, Upload, X, User } from 'lucide-react';

interface ProfileImageUploadProps {
  darkMode: boolean;
}

export default function ProfileImageUpload({ darkMode }: ProfileImageUploadProps) {
  const { profileImage, setProfileImage, userName } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 5MB.');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfileImage(result);
      setIsUploading(false);
    };

    reader.onerror = () => {
      alert('Erreur lors du chargement de l\'image.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`rounded-2xl p-6 border transition-all duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className="text-xl font-poly font-bold mb-6">Photo de profil</h3>
      
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Photo de profil actuelle */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Photo de profil" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          
          {/* Bouton de modification sur la photo */}
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg hover:from-amber-500 hover:to-amber-600 transition-all duration-200 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Informations et actions */}
        <div className="flex-1 text-center sm:text-left">
          <h4 className="font-poly font-bold text-lg mb-2">{userName}</h4>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Personnalisez votre photo de profil pour une expérience plus personnelle
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-xl font-poly font-semibold hover:from-amber-500 hover:to-amber-600 transition-all duration-200 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Chargement...' : 'Changer la photo'}
            </button>
            
            {profileImage && (
              <button
                onClick={handleRemoveImage}
                className={`flex items-center justify-center px-4 py-2 border rounded-xl font-poly font-semibold transition-all duration-200 ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <X className="w-4 h-4 mr-2" />
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Informations sur les formats acceptés */}
      <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <strong>Formats acceptés :</strong> JPG, PNG, GIF, WebP
          <br />
          <strong>Taille maximale :</strong> 5MB
          <br />
          <strong>Recommandation :</strong> Image carrée de 400x400px minimum
        </p>
      </div>
    </div>
  );
}

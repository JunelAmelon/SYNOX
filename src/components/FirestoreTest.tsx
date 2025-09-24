import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getUserProfile, 
  createUserProfile, 
  updateProfileImage 
} from '../services/profileService';

interface FirestoreTestProps {
  darkMode: boolean;
}

export default function FirestoreTest({ darkMode }: FirestoreTestProps) {
  const { currentUser } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestingRunning, setIsTestingRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    if (!currentUser) {
      addResult('❌ Aucun utilisateur connecté');
      return;
    }

    setIsTestingRunning(true);
    setTestResults([]);
    addResult('🚀 Début des tests Firestore...');

    try {
      // Test 1: Vérifier la lecture
      addResult('📖 Test 1: Lecture du profil...');
      const profile = await getUserProfile(currentUser.uid);
      addResult(`✅ Profil lu: ${profile ? 'Existe' : 'N\'existe pas'}`);

      // Test 2: Créer/Mettre à jour le profil
      if (!profile) {
        addResult('📝 Test 2: Création du profil...');
        await createUserProfile(currentUser.uid, {
          userName: 'Test User',
          userEmail: currentUser.email || 'test@example.com',
        });
        addResult('✅ Profil créé avec succès');
      } else {
        addResult('📝 Test 2: Profil existe déjà');
      }

      // Test 3: Mettre à jour la photo de profil avec une image de test
      addResult('🖼️ Test 3: Mise à jour de la photo de profil...');
      const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      await updateProfileImage(currentUser.uid, testImage);
      addResult('✅ Photo de profil mise à jour');

      // Test 4: Vérifier que la photo a été sauvegardée
      addResult('🔍 Test 4: Vérification de la sauvegarde...');
      const updatedProfile = await getUserProfile(currentUser.uid);
      if (updatedProfile?.profileImage) {
        addResult('✅ Photo de profil trouvée dans Firestore');
        addResult(`📊 Taille de l'image: ${updatedProfile.profileImage.length} caractères`);
      } else {
        addResult('❌ Photo de profil non trouvée dans Firestore');
      }

      addResult('🎉 Tests terminés avec succès !');

    } catch (error) {
      addResult(`❌ Erreur pendant les tests: ${error}`);
      console.error('Erreur tests Firestore:', error);
    } finally {
      setIsTestingRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className={`rounded-2xl p-6 border transition-all duration-300 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className="text-xl font-poly font-bold mb-4">🔥 Test Firestore</h3>
      
      <div className="flex gap-3 mb-4">
        <button
          onClick={runTests}
          disabled={isTestingRunning || !currentUser}
          className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl font-poly font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
        >
          {isTestingRunning ? 'Tests en cours...' : 'Lancer les tests'}
        </button>
        
        <button
          onClick={clearResults}
          className={`px-4 py-2 border rounded-xl font-poly font-semibold transition-all duration-200 ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Effacer
        </button>
      </div>

      {!currentUser && (
        <div className="mb-4 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ Vous devez être connecté pour lancer les tests
          </p>
        </div>
      )}

      <div className={`max-h-96 overflow-y-auto p-4 rounded-xl font-mono text-sm ${
        darkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-50 text-gray-800'
      }`}>
        {testResults.length === 0 ? (
          <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
            Aucun test lancé. Cliquez sur "Lancer les tests" pour commencer.
          </p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="mb-1">
              {result}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Instructions :</strong>
          <br />
          1. Lancez les tests pour vérifier la connectivité Firestore
          <br />
          2. Vérifiez la console du navigateur pour plus de détails
          <br />
          3. Allez dans Firebase Console → Firestore → Collection "userProfiles"
        </p>
      </div>
    </div>
  );
}

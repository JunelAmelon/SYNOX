// Script temporaire pour corriger les tiers de confiance
// À exécuter dans la console du navigateur

// Fonction pour mettre à jour un tiers de confiance
async function updateTrustedPartyStatus(trustedPartyId, newStatus = 'active', newPermissions = ['approve_withdrawals', 'view_vaults']) {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase/firebase');
    
    const partyRef = doc(db, 'trustedThirdParties', trustedPartyId);
    await updateDoc(partyRef, {
      status: newStatus,
      permissions: newPermissions
    });
    
    console.log(`✅ Tiers ${trustedPartyId} mis à jour: status=${newStatus}, permissions=${newPermissions.join(', ')}`);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  }
}

// Fonction pour lister tous les tiers
async function listAllTrustedParties() {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db, auth } = await import('../firebase/firebase');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ Utilisateur non connecté');
      return;
    }
    
    const q = query(
      collection(db, 'trustedThirdParties'),
      where('userId', '==', currentUser.uid)
    );
    
    const snapshot = await getDocs(q);
    const parties = [];
    
    snapshot.forEach((doc) => {
      parties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('📋 Liste de tous vos tiers de confiance:');
    parties.forEach((party, index) => {
      console.log(`${index + 1}. ${party.name} (${party.email})`);
      console.log(`   ID: ${party.id}`);
      console.log(`   Status: ${party.status}`);
      console.log(`   Permissions: ${party.permissions?.join(', ') || 'Aucune'}`);
      console.log('---');
    });
    
    return parties;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Instructions d'utilisation
console.log(`
🔧 SCRIPT DE DEBUG TIERS DE CONFIANCE

1. Pour lister tous vos tiers:
   listAllTrustedParties()

2. Pour activer un tiers et lui donner les bonnes permissions:
   updateTrustedPartyStatus('ID_DU_TIERS', 'active', ['approve_withdrawals', 'view_vaults'])

Exemple:
   updateTrustedPartyStatus('abc123', 'active', ['approve_withdrawals', 'view_vaults'])
`);

// Exporter les fonctions pour utilisation
window.debugTrustedParties = {
  listAll: listAllTrustedParties,
  updateStatus: updateTrustedPartyStatus
};

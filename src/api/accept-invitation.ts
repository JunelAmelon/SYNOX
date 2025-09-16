import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../firebase/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  addDoc,
  Timestamp 
} from 'firebase/firestore';
// Removed emailService import as we now use direct API calls

// Fonction pour générer un code de 12 chiffres unique
function generateAccessCode(): string {
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

// Fonction pour vérifier l'unicité du code
async function isCodeUnique(code: string): Promise<boolean> {
  const q = query(
    collection(db, 'trustedThirdParties'),
    where('accessCode', '==', code)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty;
}

// Générer un code unique
async function generateUniqueAccessCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  
  do {
    code = generateAccessCode();
    isUnique = await isCodeUnique(code);
  } while (!isUnique);
  
  return code;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { token, trustedPartyName } = req.body;

    if (!token || !trustedPartyName) {
      return res.status(400).json({ error: 'Token et nom requis' });
    }

    // Rechercher l'invitation par token
    const invitationQuery = query(
      collection(db, 'trustedPartyInvitations'),
      where('token', '==', token),
      where('status', '==', 'sent')
    );

    const invitationSnapshot = await getDocs(invitationQuery);

    if (invitationSnapshot.empty) {
      return res.status(404).json({ error: 'Invitation non trouvée ou déjà utilisée' });
    }

    const invitationDoc = invitationSnapshot.docs[0];
    const invitationData = invitationDoc.data();

    // Vérifier l'expiration
    const now = new Date();
    const expiryDate = invitationData.expiresAt.toDate();

    if (now > expiryDate) {
      return res.status(410).json({ error: 'Invitation expirée' });
    }

    // Rechercher le tiers de confiance correspondant
    const trustedPartyQuery = query(
      collection(db, 'trustedThirdParties'),
      where('invitationToken', '==', token),
      where('status', '==', 'pending')
    );

    const trustedPartySnapshot = await getDocs(trustedPartyQuery);

    if (trustedPartySnapshot.empty) {
      return res.status(404).json({ error: 'Tiers de confiance non trouvé' });
    }

    const trustedPartyDoc = trustedPartySnapshot.docs[0];
    const trustedPartyData = trustedPartyDoc.data();

    // Générer le code d'accès unique
    const accessCode = await generateUniqueAccessCode();

    // Mettre à jour le statut du tiers de confiance
    await updateDoc(doc(db, 'trustedThirdParties', trustedPartyDoc.id), {
      status: 'active',
      accessCode,
      acceptedDate: Timestamp.fromDate(now),
      invitationToken: null, // Supprimer le token après utilisation
    });

    // Marquer l'invitation comme acceptée
    await updateDoc(doc(db, 'trustedPartyInvitations', invitationDoc.id), {
      status: 'accepted',
      acceptedAt: Timestamp.fromDate(now),
    });

    // Créer un enregistrement d'acceptation
    await addDoc(collection(db, 'trustedPartyAcceptances'), {
      trustedPartyId: trustedPartyDoc.id,
      invitationId: invitationDoc.id,
      accessCode,
      acceptedBy: trustedPartyName,
      acceptedAt: Timestamp.fromDate(now),
      fromUserId: invitationData.fromUserId,
      fromUserName: invitationData.fromUserName,
    });

    // Envoyer l'email avec le code d'accès
    try {
      const response = await fetch('/api/send-access-code-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trustedPartyEmail: trustedPartyData.email,
          trustedPartyName,
          inviterName: invitationData.fromUserName,
          accessCode,
          permissions: trustedPartyData.permissions,
        }),
      });

      if (response.ok) {
        console.log('Email de code d\'accès envoyé avec succès');
      } else {
        console.error('Erreur lors de l\'envoi de l\'email de code d\'accès');
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de code d\'accès:', emailError);
      // Ne pas faire échouer l'acceptation si l'email échoue
    }

    // Envoyer une notification push si configurée
    try {
      // Ici on pourrait envoyer une notification push au propriétaire
      // pour l'informer que son invitation a été acceptée
      console.log('Invitation acceptée par:', trustedPartyName);
    } catch (notificationError) {
      console.error('Erreur lors de l\'envoi de la notification:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: 'Invitation acceptée avec succès',
      accessCode, // On peut renvoyer le code pour affichage immédiat
      trustedPartyId: trustedPartyDoc.id,
    });

  } catch (error) {
    console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}

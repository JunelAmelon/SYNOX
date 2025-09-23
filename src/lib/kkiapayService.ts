// Configuration Kkiapay pour API REST
const kkiapayConfig = {
  publickey: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || '',
  secretkey: import.meta.env.VITE_KKIAPAY_SECRET_KEY || '',
  baseUrl: 'https://api.kkiapay.me/v1'
};

console.log('🔧 [KkiapayService] Configuration:', {
  publickey: kkiapayConfig.publickey ? kkiapayConfig.publickey.substring(0, 10) + '...' : 'MANQUANTE',
  secretkey: kkiapayConfig.secretkey ? kkiapayConfig.secretkey.substring(0, 10) + '...' : 'MANQUANTE',
  baseUrl: kkiapayConfig.baseUrl
});

export interface KkiapayRefundData {
  transactionId: string;
  amount: number;
  reason: string;
  userEmail: string;
  vaultId: string;
}

export interface KkiapayRefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
  details?: any;
}

export class KkiapayService {
  
  /**
   * Vérifier le statut d'une transaction Kkiapay via API REST
   */
  static async verifyTransaction(transactionId: string): Promise<any> {
    try {
      console.log('🔍 [KkiapayService] Vérification transaction:', transactionId);
      
      const response = await fetch(`${kkiapayConfig.baseUrl}/transactions/${transactionId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${kkiapayConfig.secretkey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ [KkiapayService] Transaction vérifiée:', data);
      return data;
      
    } catch (error) {
      console.error('❌ [KkiapayService] Erreur vérification transaction:', error);
      throw error;
    }
  }

  /**
   * Effectuer un remboursement Kkiapay
   */
  static async refundTransaction(data: KkiapayRefundData): Promise<KkiapayRefundResult> {
    try {
      console.log('🔄 [KkiapayService] Début remboursement:', {
        transactionId: data.transactionId,
        amount: data.amount,
        reason: data.reason
      });

      // 1. Vérifier d'abord que la transaction existe et est valide
      const transactionStatus = await this.verifyTransaction(data.transactionId);
      
      if (!transactionStatus || transactionStatus.status !== 'SUCCESS') {
        return {
          success: false,
          error: 'Transaction non trouvée ou non valide pour remboursement'
        };
      }

      // 2. Effectuer le remboursement via API REST
      const refundResponse = await fetch(`${kkiapayConfig.baseUrl}/transactions/${data.transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kkiapayConfig.secretkey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: data.amount,
          reason: data.reason
        })
      });
      
      if (!refundResponse.ok) {
        const errorData = await refundResponse.json().catch(() => ({}));
        throw new Error(`HTTP ${refundResponse.status}: ${errorData.message || refundResponse.statusText}`);
      }
      
      const refundData = await refundResponse.json();
      console.log('✅ [KkiapayService] Remboursement effectué:', refundData);
      
      return {
        success: true,
        refundId: refundData.refund_id || refundData.id || `refund_${Date.now()}`,
        details: refundData
      };

    } catch (error) {
      console.error('❌ [KkiapayService] Erreur remboursement:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors du remboursement',
        details: error
      };
    }
  }

  /**
   * Trouver la transaction de dépôt la plus récente pour un coffre
   */
  static async findLatestDepositTransaction(vaultId: string, userId: string): Promise<string | null> {
    try {
      console.log('🔍 [KkiapayService] Recherche dernière transaction de dépôt pour coffre:', vaultId);
      
      // Cette fonction devrait interroger votre base de données Firebase
      // pour trouver la transaction de dépôt la plus récente
      // Pour l'instant, on retourne null - à implémenter selon votre structure de données
      
      // TODO: Implémenter la recherche dans Firebase
      // const transactions = await getDocs(query(
      //   collection(db, 'transactions'),
      //   where('vaultId', '==', vaultId),
      //   where('userId', '==', userId),
      //   where('type', '==', 'Versement'),
      //   where('status', '==', 'active'),
      //   orderBy('createdAt', 'desc'),
      //   limit(1)
      // ));
      
      console.log('⚠️ [KkiapayService] Recherche de transaction non implémentée - retour null');
      return null;
      
    } catch (error) {
      console.error('❌ [KkiapayService] Erreur recherche transaction:', error);
      return null;
    }
  }

  /**
   * Traiter un remboursement complet pour un coffre d'épargne libre
   */
  static async processVaultRefund(vaultId: string, amount: number, reason: string): Promise<KkiapayRefundResult> {
    try {
      console.log('🏦 [KkiapayService] Traitement remboursement coffre:', {
        vaultId,
        amount,
        reason
      });

      // 1. Trouver la transaction de dépôt à rembourser
      const transactionId = await this.findLatestDepositTransaction(vaultId, 'user');
      
      if (!transactionId) {
        return {
          success: false,
          error: 'Aucune transaction de dépôt trouvée pour ce coffre'
        };
      }

      // 2. Effectuer le remboursement
      const refundResult = await this.refundTransaction({
        transactionId,
        amount,
        reason,
        userEmail: '', // À récupérer depuis les données utilisateur
        vaultId
      });

      return refundResult;

    } catch (error) {
      console.error('❌ [KkiapayService] Erreur traitement remboursement coffre:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
}

export default KkiapayService;

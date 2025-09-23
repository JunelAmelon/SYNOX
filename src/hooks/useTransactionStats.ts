import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from './useAuth';

export interface TransactionStats {
  // Totaux
  totalDeposits: number;
  totalWithdrawals: number;
  totalRefunds: number;
  netBalance: number;
  
  // Compteurs
  depositsCount: number;
  withdrawalsCount: number;
  refundsCount: number;
  totalTransactions: number;
  
  // Moyennes
  averageDeposit: number;
  averageWithdrawal: number;
  averageTransaction: number;
  
  // Par période
  thisMonth: {
    deposits: number;
    withdrawals: number;
    count: number;
  };
  lastMonth: {
    deposits: number;
    withdrawals: number;
    count: number;
  };
  
  // Répartition par méthode de paiement
  byPaymentMethod: { [key: string]: { amount: number; count: number } };
  
  // Répartition par type
  byType: { [key: string]: { amount: number; count: number } };
  
  // Transactions récentes
  recentTransactions: any[];
  
  // Tendances
  monthlyTrend: Array<{
    month: string;
    deposits: number;
    withdrawals: number;
    net: number;
  }>;
}

export const useTransactionStats = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = async () => {
    try {
      console.log('📊 [TransactionStats] Calcul des statistiques de transactions...');
      setLoading(true);
      
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupérer toutes les transactions (sans orderBy pour éviter l'index composite)
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      
      const snapshot = await getDocs(transactionsQuery);
      const allTransactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      } as any));

      // Trier les transactions par date (plus récent en premier)
      allTransactions.sort((a: any, b: any) => {
        const dateA = a.createdAt?.getTime?.() || 0;
        const dateB = b.createdAt?.getTime?.() || 0;
        return dateB - dateA;
      });

      console.log('💳 [TransactionStats] Transactions récupérées:', allTransactions.length);
      setTransactions(allTransactions);

      // Calculer les statistiques
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Filtrer par type et statut
      const deposits = allTransactions.filter(t => 
        t.type === 'Versement' && (t.status === 'active' || t.status === 'completed')
      );
      const withdrawals = allTransactions.filter(t => 
        t.type === 'Retrait' && (t.status === 'completed')
      );
      const refunds = allTransactions.filter(t => 
        t.type === 'Remboursement' && (t.status === 'completed')
      );

      // Calculs des totaux
      const totalDeposits = deposits.reduce((sum, t) => sum + Math.abs(t.montant || 0), 0);
      const totalWithdrawals = withdrawals.reduce((sum, t) => sum + Math.abs(t.montant || 0), 0);
      const totalRefunds = refunds.reduce((sum, t) => sum + Math.abs(t.montant || 0), 0);
      const netBalance = totalDeposits - totalWithdrawals;

      // Moyennes
      const averageDeposit = deposits.length > 0 ? totalDeposits / deposits.length : 0;
      const averageWithdrawal = withdrawals.length > 0 ? totalWithdrawals / withdrawals.length : 0;
      const averageTransaction = allTransactions.length > 0 
        ? (totalDeposits + totalWithdrawals) / allTransactions.length 
        : 0;

      // Statistiques mensuelles
      const thisMonthTransactions = allTransactions.filter(t => t.createdAt >= thisMonthStart);
      const lastMonthTransactions = allTransactions.filter(t => 
        t.createdAt >= lastMonthStart && t.createdAt <= lastMonthEnd
      );

      const thisMonth = {
        deposits: thisMonthTransactions
          .filter(t => t.type === 'Versement')
          .reduce((sum, t) => sum + Math.abs(t.montant || 0), 0),
        withdrawals: thisMonthTransactions
          .filter(t => t.type === 'Retrait')
          .reduce((sum, t) => sum + Math.abs(t.montant || 0), 0),
        count: thisMonthTransactions.length
      };

      const lastMonth = {
        deposits: lastMonthTransactions
          .filter(t => t.type === 'Versement')
          .reduce((sum, t) => sum + Math.abs(t.montant || 0), 0),
        withdrawals: lastMonthTransactions
          .filter(t => t.type === 'Retrait')
          .reduce((sum, t) => sum + Math.abs(t.montant || 0), 0),
        count: lastMonthTransactions.length
      };

      // Répartition par méthode de paiement
      const byPaymentMethod: { [key: string]: { amount: number; count: number } } = {};
      allTransactions.forEach(t => {
        const method = t.paymentMethod || 'Autre';
        if (!byPaymentMethod[method]) {
          byPaymentMethod[method] = { amount: 0, count: 0 };
        }
        byPaymentMethod[method].amount += Math.abs(t.montant || 0);
        byPaymentMethod[method].count += 1;
      });

      // Répartition par type
      const byType: { [key: string]: { amount: number; count: number } } = {};
      allTransactions.forEach(t => {
        const type = t.type || 'Autre';
        if (!byType[type]) {
          byType[type] = { amount: 0, count: 0 };
        }
        byType[type].amount += Math.abs(t.montant || 0);
        byType[type].count += 1;
      });

      // Tendances mensuelles (6 derniers mois)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        
        const monthTransactions = allTransactions.filter(t => 
          t.createdAt >= date && t.createdAt < nextDate
        );

        const monthDeposits = monthTransactions
          .filter(t => t.type === 'Versement')
          .reduce((sum, t) => sum + Math.abs(t.montant || 0), 0);

        const monthWithdrawals = monthTransactions
          .filter(t => t.type === 'Retrait')
          .reduce((sum, t) => sum + Math.abs(t.montant || 0), 0);

        monthlyTrend.push({
          month: monthName,
          deposits: monthDeposits,
          withdrawals: monthWithdrawals,
          net: monthDeposits - monthWithdrawals
        });
      }

      const transactionStats: TransactionStats = {
        totalDeposits,
        totalWithdrawals,
        totalRefunds,
        netBalance,
        depositsCount: deposits.length,
        withdrawalsCount: withdrawals.length,
        refundsCount: refunds.length,
        totalTransactions: allTransactions.length,
        averageDeposit,
        averageWithdrawal,
        averageTransaction,
        thisMonth,
        lastMonth,
        byPaymentMethod,
        byType,
        recentTransactions: allTransactions.slice(0, 10), // 10 plus récentes
        monthlyTrend
      };

      console.log('✅ [TransactionStats] Statistiques calculées:', transactionStats);
      setStats(transactionStats);
      setError(null);

    } catch (err) {
      console.error('❌ [TransactionStats] Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attendre que l'authentification soit terminée
    if (authLoading) return;
    if (!currentUser) return;
    
    calculateStats();
  }, [authLoading, currentUser]);

  const refreshStats = () => {
    calculateStats();
  };

  return {
    stats,
    transactions,
    loading,
    error,
    refreshStats
  };
};

export default useTransactionStats;

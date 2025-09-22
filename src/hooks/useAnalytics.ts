import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

export interface AnalyticsData {
  // Statistiques générales
  totalSaved: number;
  totalVaults: number;
  activeVaults: number;
  completedVaults: number;
  
  // Transactions
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  
  // Performance
  monthlyGrowth: number;
  averageContribution: number;
  completionRate: number;
  bestPerformingVault: string;
  
  // Répartition par type
  vaultsByType: { [key: string]: number };
  transactionsByType: { [key: string]: number };
  
  // Tendances mensuelles
  monthlyData: Array<{
    month: string;
    deposits: number;
    withdrawals: number;
    balance: number;
  }>;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateAnalytics = async () => {
    try {
      console.log('📊 [Analytics] Calcul des statistiques en cours...');
      setLoading(true);
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      // 1. Récupérer tous les coffres
      console.log('🏦 [Analytics] Récupération des coffres...');
      const vaultsQuery = query(
        collection(db, 'vaults'),
        where('userId', '==', currentUser.uid)
      );
      const vaultsSnapshot = await getDocs(vaultsQuery);
      const vaults = vaultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      // 2. Récupérer toutes les transactions (sans orderBy pour éviter l'index composite)
      console.log('💳 [Analytics] Récupération des transactions...');
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      } as any));

      // 3. Calculer les statistiques
      console.log('🧮 [Analytics] Calcul des métriques...');
      
      // Statistiques des coffres
      const totalSaved = vaults.reduce((sum: number, vault: any) => sum + (vault.current || 0), 0);
      const totalVaults = vaults.length;
      const activeVaults = vaults.filter((v: any) => !v.isLocked && v.current > 0).length;
      const completedVaults = vaults.filter((v: any) => v.target && v.current >= v.target).length;

      // Statistiques des transactions
      const deposits = transactions.filter((t: any) => t.type === 'Versement' && t.status === 'active');
      const withdrawals = transactions.filter((t: any) => t.type === 'Retrait' && t.status === 'completed');
      
      const totalDeposits = deposits.reduce((sum: number, t: any) => sum + Math.abs(t.montant || 0), 0);
      const totalWithdrawals = withdrawals.reduce((sum: number, t: any) => sum + Math.abs(t.montant || 0), 0);
      const totalTransactions = transactions.length;
      const averageTransactionAmount = totalTransactions > 0 
        ? (totalDeposits + totalWithdrawals) / totalTransactions 
        : 0;

      // Répartition par type de coffre
      const vaultsByType: { [key: string]: number } = {};
      vaults.forEach((vault: any) => {
        const type = vault.type || 'other';
        vaultsByType[type] = (vaultsByType[type] || 0) + 1;
      });

      // Répartition par type de transaction
      const transactionsByType: { [key: string]: number } = {};
      transactions.forEach((transaction: any) => {
        const type = transaction.type || 'Autre';
        transactionsByType[type] = (transactionsByType[type] || 0) + 1;
      });

      // Performance
      const completionRate = totalVaults > 0 ? (completedVaults / totalVaults) * 100 : 0;
      const bestPerformingVault = vaults.length > 0 
        ? vaults.reduce((best: any, current: any) => {
            const currentProgress = current.target ? (current.current / current.target) * 100 : 0;
            const bestProgress = best.target ? (best.current / best.target) * 100 : 0;
            return currentProgress > bestProgress ? current : best;
          }).name || 'Aucun'
        : 'Aucun';

      // Croissance mensuelle (simplifiée)
      const monthlyGrowth = deposits.length > 0 ? 
        ((totalDeposits - totalWithdrawals) / totalDeposits) * 100 : 0;

      const averageContribution = deposits.length > 0 ? totalDeposits / deposits.length : 0;

      // Données mensuelles (derniers 6 mois)
      const monthlyData = generateMonthlyData(transactions);

      const analyticsData: AnalyticsData = {
        totalSaved,
        totalVaults,
        activeVaults,
        completedVaults,
        totalDeposits,
        totalWithdrawals,
        totalTransactions,
        averageTransactionAmount,
        monthlyGrowth,
        averageContribution,
        completionRate,
        bestPerformingVault,
        vaultsByType,
        transactionsByType,
        monthlyData
      };

      console.log('✅ [Analytics] Statistiques calculées:', analyticsData);
      setAnalytics(analyticsData);
      setError(null);

    } catch (err) {
      console.error('❌ [Analytics] Erreur lors du calcul:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Générer les données mensuelles
  const generateMonthlyData = (transactions: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      
      const monthTransactions = transactions.filter((t: any) => {
        const tDate = t.createdAt?.toDate?.() || new Date(t.createdAt);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });

      const deposits = monthTransactions
        .filter((t: any) => t.type === 'Versement')
        .reduce((sum: number, t: any) => sum + Math.abs(t.montant || 0), 0);

      const withdrawals = monthTransactions
        .filter((t: any) => t.type === 'Retrait')
        .reduce((sum: number, t: any) => sum + Math.abs(t.montant || 0), 0);

      months.push({
        month: monthName,
        deposits,
        withdrawals,
        balance: deposits - withdrawals
      });
    }

    return months;
  };

  useEffect(() => {
    calculateAnalytics();
  }, []);

  const refreshAnalytics = () => {
    calculateAnalytics();
  };

  return {
    analytics,
    loading,
    error,
    refreshAnalytics
  };
};

export default useAnalytics;

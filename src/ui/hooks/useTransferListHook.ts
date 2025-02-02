import { useCallback } from 'react';

import { useProfileStore } from '@/ui/stores/profileStore';
import { useTransferListStore } from '@/ui/stores/transferListStore';
import { useWallet } from '@/ui/utils';

export const useTransferList = () => {
  const usewallet = useWallet();
  const {
    setTransactions,
    setMonitor,
    setFlowscanURL,
    setViewSourceURL,
    setLoading,
    setShowButton,
    setCount,
  } = useTransferListStore();
  const { currentWallet } = useProfileStore();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const monitor = await usewallet.getMonitor();
    setMonitor(monitor);
    try {
      const url = await usewallet.getFlowscanUrl();
      const viewSourceUrl = await usewallet.getViewSourceUrl();
      setFlowscanURL(url);
      setViewSourceURL(viewSourceUrl);
      const data = await usewallet.getTransaction(currentWallet.address!, 15, 0, 60000);
      setLoading(false);
      if (data['count'] > 0) {
        setCount(data['count'].toString());
        setShowButton(data['count'] > 15);
      }
      setTransactions(data['list']);
    } catch {
      setLoading(false);
    }
  }, [
    usewallet,
    setMonitor,
    setFlowscanURL,
    setViewSourceURL,
    setTransactions,
    setCount,
    setShowButton,
    setLoading,
    currentWallet,
  ]);

  return {
    fetchTransactions,
  };
};

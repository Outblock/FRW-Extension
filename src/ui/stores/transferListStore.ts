import create from 'zustand';

interface TransferListState {
  transactions: any[];
  monitor: string;
  flowscanURL: string;
  viewSourceURL: string;
  loading: boolean;
  showButton: boolean;
  count: string;
  setCount: (count: string) => void;
  setTransactions: (txs: any[]) => void;
  setMonitor: (monitor: string) => void;
  setFlowscanURL: (url: string) => void;
  setViewSourceURL: (url: string) => void;
  setLoading: (loading: boolean) => void;
  setShowButton: (show: boolean) => void;
}

export const useTransferListStore = create<TransferListState>((set) => ({
  transactions: [],
  monitor: 'flowscan',
  flowscanURL: 'https://www.flowscan.io',
  viewSourceURL: 'https://f.dnz.dev',
  loading: false,
  showButton: false,
  count: '0',
  setCount: (count) => set({ count }),
  setTransactions: (txs) => set({ transactions: txs }),
  setMonitor: (monitor) => set({ monitor }),
  setFlowscanURL: (url) => set({ flowscanURL: url }),
  setViewSourceURL: (url) => set({ viewSourceURL: url }),
  setLoading: (loading) => set({ loading }),
  setShowButton: (show) => set({ showButton: show }),
}));

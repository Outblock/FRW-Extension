import { useState, useEffect,useCallback } from 'react';
import { useWallet } from 'ui/utils';
import eventBus from '@/eventBus';

const tempEmoji = [
  {
    "emoji": "🥥",
    "name": "Coconut",
    "bgcolor": "#FFE4C4"
  },
  {
    "emoji": "🥑",
    "name": "Avocado",
    "bgcolor": "#98FB98"
  }
];

export const profileHooks = () => {
  const usewallet = useWallet();
  const [emojis, setEmojis] = useState(tempEmoji);
  const fetchEmojis = useCallback(async (abortController) => {
    try {
      console.log('fetchEmojis');
      const emojires = await usewallet.getEmoji(); // Ensure useWallet is correctly used
      if (!abortController.signal.aborted) {
        console.log('emojires', emojires);
        setEmojis(emojires);
        eventBus.emit('profileChanged');
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error('Failed to fetch emojis', error);
      }
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    fetchEmojis(abortController);

    return () => {
      abortController.abort();
    };
  }, [fetchEmojis]);

  return {
    emojis,
    updateEmojis: () => {
      const abortController = new AbortController();
      fetchEmojis(abortController);
    },
  };
};

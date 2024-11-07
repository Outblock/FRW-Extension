import { useState, useEffect, useCallback } from 'react';
import { useWallet } from 'ui/utils';
import { NewsItem } from 'background/service/networkModel';

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wallet = useWallet();

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      const walletNews = await wallet.getNews();
      
      const walletUnreadCount = await wallet.getUnreadNewsCount();

      if (isMounted) {
        setNews(walletNews);
        setUnreadCount(walletUnreadCount);
      }
    };

    fetchNews().catch(console.error);

    return () => {
      isMounted = false;
    };

  }, []);

  const isRead = useCallback(async (id: string): Promise<boolean> => {
    
    return await wallet?.isNewsRead(id);
  }, [wallet]);

  const markAsRead = useCallback(async (id: string) => {
    await wallet?.markNewsAsRead(id).catch(console.error);
  }, [wallet]);

  const markAllAsRead = useCallback(async () => {

    setUnreadCount(0);
    wallet?.markAllNewsAsRead().catch(console.error);
  }, [wallet]);

  const dismissNews = useCallback(async (id: string) => {

    await wallet?.markNewsAsDismissed(id).catch(console.error);
    
  }, [wallet]);

  const resetNews = useCallback(async () => {
    await wallet?.resetNews().catch(console.error);
  }, [wallet]);


  return {
    news,
    unreadCount,
    markAllAsRead,
    dismissNews,
    isRead,
    markAsRead,
    resetNews,
  };
}

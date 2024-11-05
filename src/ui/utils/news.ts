import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from 'ui/utils';

export interface NewsItem {
  id: string;
  priority: string;
  type: string;
  title: string;
  body: string;
  icon: string | null;
  image: string | null;
  url: string;
  expiry_time: string;
  display_type: string;
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wallet = useWallet();
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchNews = useCallback(async () => {
    if (!wallet || !mountedRef.current) {
      return;
    }
    
    try {
      const newsData = await wallet.getNews();
      const unreadCount = await wallet.getUnreadNewsCount();
      
      if (mountedRef.current) {
        setNews(newsData);
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  }, [wallet]);

  const markAllAsRead = useCallback(async () => {
    if (!wallet || !mountedRef.current) return;
    
    await wallet.markAllNewsAsRead();
    if (mountedRef.current) {
      setUnreadCount(0);
      setNews([]);
    }
  }, [wallet]);

  const dismissNews = useCallback(async (id: string) => {
    if (!wallet || !mountedRef.current) return;

    await wallet.markNewsAsRead(id);
    if (mountedRef.current) {
      setNews((currentNews) => currentNews.filter((n) => n.id !== id));
      setUnreadCount((count) => Math.max(0, count - 1));
    }
  }, [wallet]);

  const resetNews = useCallback(async () => {
    if (!wallet || !mountedRef.current) return;
    
    await wallet.resetNews();
    if (mountedRef.current) {
      fetchNews();
    }
  }, [wallet, fetchNews]);

  useEffect(() => {
    const fetchAndUpdate = async () => {
      if (mountedRef.current) {
        await fetchNews();
      }
    };

    fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, [fetchNews, mountedRef?.current]);

  return {
    news,
    unreadCount,
    fetchNews,
    markAllAsRead,
    dismissNews,
    resetNews,
  };
}

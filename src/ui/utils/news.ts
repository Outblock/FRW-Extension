import { useState, useEffect, useCallback } from 'react';
import { useWallet } from 'ui/utils';

interface NewsItem {
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

  const fetchNews = useCallback(async () => {
    if (!wallet) {
      return;
    }
    try {

      const newsData = await wallet.getNews();
      setNews(newsData);
      setUnreadCount(newsData.length);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  }, [wallet]);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const dismissNews = useCallback((id: string) => {
    setNews((currentNews) => currentNews.filter((n) => n.id !== id));
    setUnreadCount((count) => Math.max(0, count - 1));
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    unreadCount,
    fetchNews,
    markAllAsRead,
    dismissNews,
  };
}

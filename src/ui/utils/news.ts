import { useState, useEffect, useCallback } from 'react';
// TODO: add firebase remote config
// import { getRemoteConfig, getValue } from 'firebase/remote-config';

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

  // TODO: remove this after testing
  const fetchNews = useCallback(async () => {
    /*
    try {

      const remoteConfig = getRemoteConfig();
      console.log('remoteConfig', remoteConfig);

      const newsValue = getValue(remoteConfig, 'news');
      const newsData: NewsItem[] = JSON.parse(newsValue.asString());

      // Filter out expired news
      const now = new Date();
      const activeNews = newsData.filter((n) => new Date(n.expiry_time) > now);

      setNews(activeNews);
      setUnreadCount(activeNews.length);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
        */
  }, []);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const dismissNews = useCallback((id: string) => {
    setNews((currentNews) => currentNews.filter((n) => n.id !== id));
    setUnreadCount((count) => Math.max(0, count - 1));
  }, []);

  // Fetch news on mount
  useEffect(() => {
    fetchNews();
  }, []);

  return {
    news,
    unreadCount,
    fetchNews,
    markAllAsRead,
    dismissNews,
  };
}

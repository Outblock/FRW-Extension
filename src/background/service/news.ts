import { createPersistStore } from 'background/utils';
import { getRemoteConfig, getValue, fetchAndActivate } from 'firebase/remote-config';
import { getApp } from 'firebase/app';

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

interface NewsStore {
  news: NewsItem[];
  lastFetched: number;
}

class NewsService {
  store!: NewsStore;

  init = async () => {
    this.store = await createPersistStore<NewsStore>({
      name: 'news',
      template: {
        news: [],
        lastFetched: 0,
      },
    });
  };

  fetchNews = async () => {
    try {

      if (!this.store) {
        await this.init();
      }
      // TODO: add proper news data
      const newsData: NewsItem[] = [
        {
          id: '1',
          priority: 'high',
          type: 'announcement',
          title: 'Welcome to Our Web3 Wallet!',
          body: 'Thank you for choosing our wallet. Explore the amazing features we offer.',
          icon: 'https://example.com/welcome-icon.png',
          image: 'https://example.com/welcome-banner.jpg',
          url: 'https://docs.example.com/welcome',
          expiry_time: '2024-12-31T23:59:59Z',
          display_type: 'banner'
        },
        {
          id: '2', 
          priority: 'medium',
          type: 'feature',
          title: 'New: Multi-Chain Support',
          body: 'We now support multiple blockchain networks. Try it out today!',
          icon: 'https://example.com/chain-icon.png',
          image: null,
          url: 'https://docs.example.com/multi-chain',
          expiry_time: '2024-06-30T23:59:59Z',
          display_type: 'card'
        },
        {
          id: '3',
          priority: 'low',
          type: 'update',
          title: 'Security Update Available',
          body: 'We\'ve enhanced our security features. Your wallet is now even more secure.',
          icon: null,
          image: null,
          url: 'https://docs.example.com/security',
          expiry_time: '2024-03-31T23:59:59Z',
          display_type: 'notification'
        }
      ];

      // Filter out expired news
      const now = new Date();
      const activeNews = newsData.filter((n) => new Date(n.expiry_time) > now);

      this.store.news = activeNews;
      this.store.lastFetched = Date.now();

      return activeNews;
    } catch (error) {
      console.error('Failed to fetch news:', error);
      return this.store.news;
    }
  };

  getNews = () => {
    console.log('background - getNews - store', this.store);
    return this.store?.news;
  };

  clear = () => {
    this.store.news = [];
    this.store.lastFetched = 0;
  };
}

export default new NewsService();

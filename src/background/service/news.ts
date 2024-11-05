import { createPersistStore } from 'background/utils';
import { getRemoteConfig, getValue, fetchAndActivate } from 'firebase/remote-config';
import { getApp } from 'firebase/app';

// Base64 encoded SVG icons
const ICONS = {
  TIMER: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#FFA726"/>
      <path d="M16 8v8l4.7 2.8M16 6c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S21.5 6 16 6z" stroke="#fff" stroke-width="2"/>
    </svg>
  `)}`,
  
  CLOUD: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#34A853"/>
      <path d="M22 20.4c2.2-0.3 4-2.2 4-4.4 0-2.5-2-4.5-4.4-4.5h-0.6C20.4 8.7 17.9 6.5 15 6.5c-3.3 0-6 2.7-6 6v0.3C7.2 13.1 6 14.4 6 16c0 1.9 1.6 3.5 3.5 3.5h12.5z" fill="#fff"/>
    </svg>
  `)}`,
  
  FLOW: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#00EF8B"/>
      <path d="M16 8l8 8-8 8-8-8 8-8z" fill="#fff"/>
    </svg>
  `)}`
};

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
  readIds: string[];
}

class NewsService {
  store!: NewsStore;

  init = async () => {
    this.store = await createPersistStore<NewsStore>({
      name: 'news',
      template: {
        news: [],
        lastFetched: 0,
        readIds: [],
      },
    });
  };

  fetchNews = async () => {
    try {
      if (!this.store) {
        await this.init();
      }

      const newsData: NewsItem[] = [
        {
          id: '1',
          priority: 'high',
          type: 'storage',
          title: 'Insufficient storage',
          body: 'Add FLOW to earn more storage.',
          icon: ICONS.TIMER,
          image: null,
          url: '',
          expiry_time: '2024-12-31T23:59:59Z',
          display_type: 'notification'
        },
        {
          id: '2',
          priority: 'high',
          type: 'recommendation',
          title: 'Recommend to Backup',
          body: 'Upgrade to get the latest features',
          icon: ICONS.CLOUD,
          image: null,
          url: '/backup',
          expiry_time: '2024-12-31T23:59:59Z',
          display_type: 'card'
        },
        {
          id: '3',
          priority: 'medium',
          type: 'request',
          title: 'Pending request from flow port',
          body: 'View More',
          icon: ICONS.FLOW,
          image: null,
          url: 'https://flowport.example.com/request',
          expiry_time: '2024-12-31T23:59:59Z',
          display_type: 'notification'
        },
        {
          id: '4',
          priority: 'medium',
          type: 'request',
          title: 'Pending request from flow port',
          body: 'View More',
          icon: ICONS.FLOW,
          image: null,
          url: 'https://flowport.example.com/request',
          expiry_time: '2024-12-31T23:59:59Z',
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

  markAsRead = async (id: string) => {
    if (!this.store) {
      await this.init();
    }
    if (!this.store.readIds.includes(id)) {
      this.store.readIds = [...this.store.readIds, id];
    }
  };

  markAllAsRead = async () => {
    if (!this.store) {
      await this.init();
    }
    const currentNews = this.store.news || [];
    this.store.readIds = [...new Set([...(this.store.readIds || []), ...currentNews.map(n => n.id)])];
    return this.store.readIds;
  };

  isRead = (id: string) => {
    return this.store.readIds.includes(id);
  };

  getUnreadCount = async () => {
    if (!this.store) {
      await this.init();
    }
    console.log('background - getUnreadCount - store', this.store);
    const unreadCount = this.store?.news.filter(item => !this.isRead(item.id))?.length;
    console.log('background - getUnreadCount - unreadCount', unreadCount);

    return unreadCount;
  };

  clear = () => {
    if (this.store) {
      this.store.news = [];
      this.store.lastFetched = 0;
      this.store.readIds = [];
    }
  };

  reset = async () => {
    this.clear();

    await this.fetchNews();
   
  };
}

export default new NewsService();

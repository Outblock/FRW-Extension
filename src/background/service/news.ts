import { createPersistStore } from 'background/utils';
import { NewsItem } from './networkModel';
import { storage } from 'background/webapi';

import openapi from './openapi';

interface NewsStore {
  readIds: string[];
  dismissedIds: string[];
}

class NewsService {
  store!: NewsStore;

  init = async () => {
    console.log('NewsService init');
    try {
      this.store = await createPersistStore<NewsStore>({
        name: 'news',
        template: {
          readIds: [], // ids of news that are read
          dismissedIds: [], // ids of news that are dismissed
        },
        fromStorage: true,
      });
    } catch (error) {
      console.error('Error initializing NewsService', error);

      // Try clearing the store
      this.clear();
      try {
        this.store = await createPersistStore<NewsStore>({
          name: 'news',
          template: {
            readIds: [], // ids of news that are read
            dismissedIds: [], // ids of news that are dismissed
          },
          fromStorage: false,
        });
      } catch (error) {
        console.error('Error initializing NewsService', error);
      }
    }
  };

  getNews = async (): Promise<NewsItem[]> => {
    if (!this.store) await this.init();

    const news = await openapi.getNews();

    // Remove dismissed news from the list
    const filteredNews = news.filter((n) => !this.isDismissed(n.id));

    // TODO: calculate unread count here

    return filteredNews;
  };

  isRead = (id: string): boolean => {
    // TODO: we could use a set for this, but it's not a big deal
    return this.store?.readIds?.includes(id);
  };

  markAsRead = async (id: string) => {
    if (!this.store) await this.init();

    const news = await this.getNews();

    if (!this.isRead(id)) {
      // Use this opportunity to clear the read ids that are not in the new news
      // Don't love this, but it's a quick way to do it
      this.store.readIds = [
        ...this.store.readIds.filter((readId) =>
          news.some((n) => n.id === readId)
        ),
        id,
      ];
    }
  };

  markAllAsRead = async () => {
    if (!this.store) await this.init();

    const news = await this.getNews();
    this.store.readIds = news.map((n) => n.id);
  };

  getUnreadCount = async () => {
    if (!this.store) await this.init();

    // Not sure I love this, but it's a quick way to get the unread count
    // The frontend should cache the unread count
    const news = await this.getNews();

    const unreadCount = news.reduce((count, item) => 
      this.isRead(item.id) ? count : count + 1, 0);

    return unreadCount;
  };

  isDismissed = (id: string): boolean => {
    // TODO: we could use a set for this, but it's not a big deal
    return this.store?.dismissedIds?.includes(id);
  };

  markAsDismissed = async (id: string) => {
    if (!this.store) await this.init();

    const news = await this.getNews();

    // Mark as read first
    this.markAsRead(id);

    // Add to dismissed ids if not already there
    if (!this.isDismissed(id)) {
      // Use this opportunity to clear the dismissed ids that are not in the new news
      // Don't love this, but it's a quick way to do it
      this.store.dismissedIds = [
        ...this.store.dismissedIds.filter((dismissedId) =>
          news.some((n) => n.id === dismissedId)
        ),
        id,
      ];
    }
  };

  clear = () => {
    if (this.store) {
      this.store.readIds = [];
      this.store.dismissedIds = [];
    }
    storage.remove('news');
  };
}

export default new NewsService();

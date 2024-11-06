import { createPersistStore } from 'background/utils';
import { NewsItem } from './networkModel';

import openapi from './openapi';

interface NewsStore {
  readIds: string[];
}

class NewsService {
  store!: NewsStore;

  init = async () => {
    this.store = await createPersistStore<NewsStore>({
      name: 'news',
      template: {
        readIds: [],
      },
    });
  };

  getNews = async (): Promise<NewsItem[]> => {
    if (!this.store) await this.init();

    const news = await openapi.getNews();
    return news;
  };

  markAsRead = async (id: string) => {
    if (!this.store) await this.init();

    const news = await this.getNews();

    if (!this.store.readIds.includes(id)) {
      const newsItem = news.find((n) => n.id === id);
      if (newsItem && newsItem.displayType === 'click') {
        // It's a valid news item and it can be marked as read

        // Use this opportunity to clear the read ids that are not in the new news
        this.store.readIds = [
          ...this.store.readIds.filter((readId) =>
            news.some((n) => n.id === readId)
          ),
          id,
        ];
      }
    }
  };

  markAllAsRead = async () => {
    if (!this.store) await this.init();

    const news = await this.getNews();
    news.forEach((n) => {
      if (n.displayType === 'click') this.markAsRead(n.id);
    });
  };

  isRead = (id: string): boolean => {
    return this.store?.readIds?.includes(id);
  };

  getUnreadCount = async () => {
    if (!this.store) await this.init();

    // Not sure I love this, but it's a quick way to get the unread count
    // The frontend should cache the unread count
    const news = await this.getNews();

    const unreadCount = news.filter(
      (item) => item.displayType === 'click' && !this.isRead(item.id)
    )?.length;

    return unreadCount;
  };

  clear = () => {
    if (this.store) {
      this.store.readIds = [];
    }
  };
}

export default new NewsService();

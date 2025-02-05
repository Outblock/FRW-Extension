import debounce from 'debounce';

import { storage } from 'background/webapi';

const sessionStorage = (name: string, obj: object) => {
  debounce(() => storage.setSession(name, obj), 1000);
};

interface CreateSessionStoreParams<T> {
  name: string;
  template?: T;
  fromStorage?: boolean;
}

const createSessionStore = async <T extends object>({
  name,
  template = Object.create(null),
  fromStorage = true,
}: CreateSessionStoreParams<T>): Promise<T> => {
  let tpl = template;

  if (fromStorage) {
    const storageCache = await storage.getSession(name);
    tpl = storageCache || template;
    if (!storageCache) {
      await storage.setSession(name, tpl);
    }
  }

  const createProxy = <A extends object>(obj: A): A =>
    new Proxy(obj, {
      set(target, prop, value) {
        if (typeof value === 'object' && value !== null) {
          target[prop] = createProxy(value);
        }

        target[prop] = value;

        sessionStorage(name, target);

        return true;
      },

      deleteProperty(target, prop) {
        if (Reflect.has(target, prop)) {
          Reflect.deleteProperty(target, prop);

          sessionStorage(name, target);
        }

        return true;
      },
    });
  return createProxy<T>(tpl);
};

export default createSessionStore;

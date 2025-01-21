import { cleanAuth, cleanExtension } from './helper';

export default async function globalTeardown() {
  //   Create a new page and navigate to extension
  await cleanAuth();
  await cleanExtension();
}

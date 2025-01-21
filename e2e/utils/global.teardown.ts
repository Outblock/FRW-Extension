import { cleanAuth, cleanExtension, loadExtension } from './helper';

export default async function globalTeardown() {
  //   const { context, extensionId } = await loadExtension();
  // Create a new page and navigate to extension
  await cleanAuth();
  await cleanExtension();
}

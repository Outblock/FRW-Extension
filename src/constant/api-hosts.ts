export const INITIAL_OPENAPI_URL =
  process.env.NODE_ENV === 'production' ? 'https://api.lilico.app' : 'https://dev.lilico.app';
export const WEB_NEXT_URL =
  process.env.NODE_ENV === 'production' ? 'https://lilico.app' : 'https://test.lilico.app';
export const FIREBASE_FUNCTIONS_URL = process.env.FB_FUNCTIONS!;

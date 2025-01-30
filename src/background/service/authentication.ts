import { initializeApp } from 'firebase/app';
import {
  getAuth,
  getIdToken,
  indexedDBLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithCustomToken,
  type Unsubscribe,
} from 'firebase/auth/web-extension';
import { getId, getInstallations } from 'firebase/installations';

import { getFirbaseConfig } from '../utils/firebaseConfig';

import { mixpanelTrack } from './mixpanel';

import { userWalletService } from '.';

// GLOBAL FIREBASE SETUP

// Capitalize globals for clarity
const APP_NAME: string = process.env.NODE_ENV!;
const FIREBASE_CONFIG = getFirbaseConfig();

// This is always the same app instance
const APP = initializeApp(FIREBASE_CONFIG, APP_NAME);

// This is always the same auth instance for the app, regardless of the user or whether they are signed in
const AUTH = getAuth(APP);

setPersistence(AUTH, indexedDBLocalPersistence);

// FIREBASE AUTH STATE CHANGE
onAuthStateChanged(AUTH, async (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    // note fcl setup is async
    if (user.isAnonymous) {
    } else {
      mixpanelTrack.identify(user.uid, user.displayName ?? user.uid);
    }
  } else {
    // User is signed out, sign in as anonymous temporary user
    await signInAnonymously(AUTH);
  }
});

export const waitForAuthInit = async () => {
  let unsubscribe: Unsubscribe;
  await new Promise<void>((resolve) => {
    unsubscribe = onAuthStateChanged(AUTH, (_user) => resolve());
  });
  unsubscribe!();
};

export const verifyAuthStatus = async () => {
  await waitForAuthInit();
  const user = AUTH.currentUser;
  if (user && !user.isAnonymous) {
    // Only sign in again if the user is not anonymous
    await userWalletService.reSign();
  }
};

export const getUserToken = async () => {
  // Wait for firebase auth to initialize
  await waitForAuthInit();

  let user = AUTH.currentUser;

  if (!user) {
    // If no user, then sign in as anonymous first
    await signInAnonymously(AUTH);

    user = AUTH.currentUser;
  }

  if (!user) {
    throw new Error('Could not get the user');
  }

  const idToken = await user.getIdToken();
  if (!idToken) {
    throw new Error('No idToken found');
  }
  return idToken;
};

export const proxyToken = async () => {
  // Default options are marked with *

  // Wait for firebase auth to complete
  await waitForAuthInit();

  await signInAnonymously(AUTH);
  const anonymousUser = AUTH.currentUser;
  const idToken = await anonymousUser?.getIdToken();
  return idToken;
};

export const signInWithToken = async (token: string) => {
  await signInWithCustomToken(AUTH, token);
};

// Not sure we need this or if it even works on the chrome extension
export const getAppInstallationId = async () => {
  const installations = await getInstallations(APP);
  const id = await getId(installations);
  return id;
};

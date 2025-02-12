import { create } from 'zustand';

import { type Contact } from '@/shared/types/network-types';

const DEFAULT_CONTACT: Contact = {
  address: '',
  id: 0,
  contact_name: '',
  avatar: '',
  domain: {
    domain_type: 999,
    value: '',
  },
};

interface ContactStore {
  toContact: Contact;
  fromContact: Contact;
  setToContact: (contact: Contact | null) => void;
  setFromContact: (contact: Contact | null) => void;
  resetContacts: () => void;

  // Contact Lists
  filteredContacts: Contact[];
  searchContacts: Contact[];
  // I think this is the same as filteredContacts still checking why we have two here.
  sortedContacts: Contact[];
  recentContacts: Contact[];

  // States
  isSearched: boolean;
  hasNoFilteredContacts: boolean;

  // Actions
  setFilteredContacts: (contacts: Contact[]) => void;
  setSearchContacts: (contacts: Contact[]) => void;
  setSortedContacts: (contacts: Contact[]) => void;
  setRecentContacts: (contacts: Contact[]) => void;
  setIsSearched: (searched: boolean) => void;
  setHasNoFilteredContacts: (hasNo: boolean) => void;

  // Reset
  resetContactLists: () => void;

  // Account Lists
  accountList: Contact[];
  evmAccounts: Contact[];
  childAccounts: Contact[];

  // Account Actions
  setAccountList: (accounts: Contact[]) => void;
  setEvmAccounts: (accounts: Contact[]) => void;
  setChildAccounts: (accounts: Contact[]) => void;
}

export const useContactStore = create<ContactStore>((set) => ({
  toContact: DEFAULT_CONTACT,
  fromContact: DEFAULT_CONTACT,

  setToContact: (contact) => set({ toContact: contact || DEFAULT_CONTACT }),
  setFromContact: (contact) => set({ fromContact: contact || DEFAULT_CONTACT }),

  resetContacts: () =>
    set({
      toContact: DEFAULT_CONTACT,
      fromContact: DEFAULT_CONTACT,
    }),

  // Address Book Initial states
  filteredContacts: [],
  searchContacts: [],
  sortedContacts: [],
  recentContacts: [],
  isSearched: false,
  hasNoFilteredContacts: false,

  setFilteredContacts: (contacts) => set({ filteredContacts: contacts }),
  setSearchContacts: (contacts) => set({ searchContacts: contacts }),
  setSortedContacts: (contacts) => set({ sortedContacts: contacts }),
  setRecentContacts: (contacts) => set({ recentContacts: contacts }),
  setIsSearched: (searched) => set({ isSearched: searched }),
  setHasNoFilteredContacts: (hasNo) => set({ hasNoFilteredContacts: hasNo }),

  // Account Lists Initial State
  accountList: [],
  evmAccounts: [],
  childAccounts: [],

  // Account Setters
  setAccountList: (accounts) => set({ accountList: accounts }),
  setEvmAccounts: (accounts) => set({ evmAccounts: accounts }),
  setChildAccounts: (accounts) => set({ childAccounts: accounts }),

  // Reset all lists
  resetContactLists: () =>
    set({
      filteredContacts: [],
      searchContacts: [],
      sortedContacts: [],
      recentContacts: [],
      accountList: [],
      evmAccounts: [],
      childAccounts: [],
      isSearched: false,
      hasNoFilteredContacts: false,
    }),
}));

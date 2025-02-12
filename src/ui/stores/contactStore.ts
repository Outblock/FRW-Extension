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
}));

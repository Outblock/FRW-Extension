import { type Contact } from '@/shared/types/network-types';
import { useContactStore } from '@/ui/stores/contactStore';

export const useToContact = () => {
  const { toContact, setToContact } = useContactStore();

  const updateToContact = (contact: Partial<Contact> & { address: string }) => {
    //Update the contact if the address is the same, otherwise replace the contact
    setToContact(
      contact.address === toContact.address
        ? { ...toContact, ...contact }
        : { ...DEFAULT_CONTACT, ...contact }
    );
  };

  return { toContact, updateToContact };
};

export const useFromContact = () => {
  const { fromContact, setFromContact } = useContactStore();

  const updateFromContact = (contact: Partial<Contact> & { address: string }) => {
    //Update the contact if the address is the same, otherwise replace the contact
    setFromContact(
      contact.address === fromContact.address
        ? { ...fromContact, ...contact }
        : { ...DEFAULT_CONTACT, ...contact }
    );
  };

  return { fromContact, updateFromContact };
};

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

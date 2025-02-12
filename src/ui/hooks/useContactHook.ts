import { useCallback } from 'react';

import { type Contact } from '@/shared/types/network-types';
import { withPrefix, isValidEthereumAddress } from '@/shared/utils/address';
import { useContactStore } from '@/ui/stores/contactStore';
import { useProfileStore } from '@/ui/stores/profileStore';
import { useWallet } from '@/ui/utils';

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

export function useContactHook() {
  const usewallet = useWallet();
  const contactStore = useContactStore();
  const { mainAddress, evmAddress, walletList, evmWallet, childAccounts } = useProfileStore();

  const updateToContact = (contact: Partial<Contact> & { address: string }) => {
    contactStore.setToContact(
      contact.address === contactStore.toContact.address
        ? { ...contactStore.toContact, ...contact }
        : { ...DEFAULT_CONTACT, ...contact }
    );
  };

  const updateFromContact = (contact: Partial<Contact> & { address: string }) => {
    contactStore.setFromContact(
      contact.address === contactStore.fromContact.address
        ? { ...contactStore.fromContact, ...contact }
        : { ...DEFAULT_CONTACT, ...contact }
    );
  };

  const fetchAddressBook = useCallback(async () => {
    await usewallet.setDashIndex(0);
    try {
      const response = await usewallet.getAddressBook();
      let recent = await usewallet.getRecent();

      if (recent) {
        recent.forEach((c) => {
          if (response) {
            response.forEach((s) => {
              if (c.address === s.address && c.contact_name === s.contact_name) {
                c.type = 1;
              }
            });
          }
        });
      } else {
        recent = [];
      }

      let sortedContacts = [];
      if (response) {
        sortedContacts = response.sort((a, b) =>
          a.contact_name.toLowerCase().localeCompare(b.contact_name.toLowerCase())
        );
      }

      contactStore.setRecentContacts(recent);
      contactStore.setSortedContacts(sortedContacts);
      contactStore.setFilteredContacts(sortedContacts);

      return { recent, sortedContacts };
    } catch (err) {
      console.error('Error fetching address book:', err);
      return { recent: [], sortedContacts: [] };
    }
  }, [usewallet, contactStore]);

  const convertObjectToContactArray = (
    data: Record<
      string,
      {
        name: string;
        thumbnail: { url: string };
      }
    >
  ) => {
    return Object.keys(data).map((address, index) => ({
      id: index,
      contact_name: data[address].name || address,
      username: data[address].name.toLowerCase().replace(/\s+/g, ''),
      avatar: data[address].thumbnail.url,
      address: address,
      contact_type: 1,
      domain: {
        domain_type: 999,
        value: data[address].name,
      },
    }));
  };

  const convertArrayToContactArray = (array: any[]) => {
    return array.map((item) => ({
      id: item.id,
      contact_name: item.name,
      username: item.name,
      avatar: item.icon,
      address: withPrefix(item.address) || '',
      contact_type: 1,
      bgColor: item.color,
      domain: {
        domain_type: 0,
        value: '',
      },
    })) as Contact[];
  };

  const setupAccounts = useCallback(async () => {
    const wdArray = convertArrayToContactArray(walletList);
    if (childAccounts) {
      const cAccountArray = convertObjectToContactArray(childAccounts);
      contactStore.setChildAccounts(cAccountArray);
    }

    contactStore.setAccountList(wdArray);

    if (mainAddress && isValidEthereumAddress(evmAddress) && evmWallet) {
      const evmData = {
        ...evmWallet,
        address: evmAddress,
        avatar: evmWallet.icon,
        contact_name: evmWallet.name,
        bgcolor: evmWallet.color,
      };
      contactStore.setEvmAccounts([evmData]);
    }
  }, [walletList, childAccounts, mainAddress, evmAddress, evmWallet, contactStore]);

  const findContact = useCallback(
    (address: string): Contact | null => {
      const { recentContacts, accountList, evmAccounts, childAccounts, filteredContacts } =
        contactStore;
      return (
        recentContacts.find((c) => c.address === address) ||
        accountList.find((c) => c.address === address) ||
        evmAccounts.find((c) => c.address === address) ||
        childAccounts.find((c) => c.address === address) ||
        filteredContacts.find((c) => c.address === address) ||
        null
      );
    },
    [contactStore]
  );

  return {
    toContact: contactStore.toContact,
    fromContact: contactStore.fromContact,
    updateToContact,
    updateFromContact,
    fetchAddressBook,
    setupAccounts,
    findContact,
  };
}

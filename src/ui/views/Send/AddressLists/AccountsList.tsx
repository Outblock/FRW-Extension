import { List, ListSubheader, ButtonBase, Box } from '@mui/material';
import { groupBy, isEmpty } from 'lodash';
import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { withPrefix, isValidEthereumAddress } from '@/shared/utils/address';
import { LLContactCard, LLContactEth, FWContactCard } from '@/ui/FRWComponent';
import { useProfileStore } from '@/ui/stores/profileStore';
import { useWallet } from 'ui/utils';

type ChildAccount = {
  [key: string]: {
    name: string;
    description: string;
    thumbnail: {
      url: string;
    };
  };
};

const AccountsList = ({ filteredContacts, isLoading, handleClick, isSend = true }) => {
  const usewallet = useWallet();
  const { mainAddress, evmAddress, walletList, evmWallet, childAccounts } = useProfileStore();
  const [, setGrouped] = useState<any>([]);
  const [childAccountsArray, setChildAccount] = useState<any[]>([]);

  const [accountList, setAccountListt] = useState<any[]>([]);
  const [evmData, setEvmAddress] = useState<any[]>([]);

  const getWallet = useCallback(async () => {
    const wdArray = await convertArrayToContactArray(walletList);
    if (childAccounts) {
      const cAccountArray = convertObjectToContactArray(childAccounts);
      setChildAccount(cAccountArray);
    }

    await setAccountListt(wdArray);
    if (mainAddress) {
      if (isValidEthereumAddress(evmAddress) && evmWallet) {
        const evmData = evmWallet;
        evmData['address'] = evmAddress!;
        evmData['avatar'] = evmWallet.icon;
        evmData['contact_name'] = evmWallet.name;
        evmData['bgcolor'] = evmWallet.color;
        setEvmAddress([evmData]);
      }
    }
  }, [evmAddress, evmWallet, mainAddress, walletList, childAccounts]);

  function convertObjectToContactArray(data) {
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
  }

  async function convertArrayToContactArray(array) {
    return array.map((item) => {
      console.log(' item ', item);
      return {
        id: item.id,
        contact_name: item.name,
        username: item.name,
        avatar: item.icon,
        address: withPrefix(item.address),
        contact_type: 1,
        bgColor: item.color, // Set background color
        domain: {
          domain_type: 0,
          value: '',
        },
      };
    });
  }

  const goEth = (group) => {
    if (isSend) {
      history.push({
        pathname: '/dashboard/wallet/sendeth',
        state: { contact: group },
      });
    }
  };

  useEffect(() => {
    const group = groupBy(filteredContacts, (contact) => contact.contact_name[0]);
    setGrouped(group);
    getWallet();
  }, [filteredContacts, getWallet]);

  const history = useHistory();

  return (
    <Box sx={{ height: '100%' }}>
      {!isEmpty(accountList) &&
        accountList.map((eachgroup, index) => (
          <List dense={false} sx={{ paddingTop: '0px', paddingBottom: '0px' }} key={index}>
            <Box>
              <ButtonBase
                key={`card-${index}`}
                sx={{ display: 'contents' }}
                onClick={() => handleClick(eachgroup)}
              >
                <FWContactCard contact={eachgroup} hideCloseButton={true} key={index} />
              </ButtonBase>
            </Box>
          </List>
        ))}
      {(!isEmpty(evmData) || !isEmpty(childAccountsArray)) && (
        <ListSubheader
          sx={{
            lineHeight: '18px',
            marginTop: '0px',
            marginBottom: '0px',
            backgroundColor: '#000000',
            textTransform: 'capitalize',
            py: '4px',
          }}
        >
          {chrome.i18n.getMessage('Linked_Account')}
        </ListSubheader>
      )}
      {!isEmpty(evmData) &&
        evmData.map((eachgroup, index) => (
          <List dense={false} sx={{ paddingTop: '0px', paddingBottom: '0px' }} key={index}>
            <Box>
              <ButtonBase
                key={`card-${index}`}
                sx={{ display: 'contents' }}
                onClick={() => handleClick(eachgroup)}
              >
                <LLContactEth contact={eachgroup} hideCloseButton={true} key={index} />
              </ButtonBase>
            </Box>
          </List>
        ))}

      {!isEmpty(childAccountsArray) &&
        childAccountsArray.map((eachgroup, index) => (
          <List dense={false} sx={{ paddingTop: '0px', paddingBottom: '0px' }} key={index}>
            <Box>
              <ButtonBase
                key={`card-${index}`}
                sx={{ display: 'contents' }}
                onClick={() => handleClick(eachgroup)}
              >
                <LLContactCard contact={eachgroup} hideCloseButton={true} key={index} />
              </ButtonBase>
            </Box>
          </List>
        ))}
    </Box>
  );
};

export default AccountsList;

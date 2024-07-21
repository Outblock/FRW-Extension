import React, { useEffect, useState } from 'react';
import {
  List,
  ListSubheader,
  CardMedia,
  Typography,
  ButtonBase,
  Box,
} from '@mui/material';
import { groupBy, isEmpty } from 'lodash';
import { LLContactCard, FWContactCard } from '../../FRWComponent';
import { useHistory } from 'react-router-dom';
import { useWallet } from 'ui/utils';
import { withPrefix } from '@/ui/utils/address';
import EmptyAddress from 'ui/assets/EmptyAddress.svg';

type ChildAccount = {
  [key: string]: {
    name: string;
    description: string;
    thumbnail: {
      url: string;
    };
  };
};

const AccountsList = ({ filteredContacts, isLoading, handleClick }) => {


  const usewallet = useWallet();

  const [grouped, setGrouped] = useState<any>([]);
  const [childAccounts, setChildAccount] = useState<any[]>([]);

  const [walletList, setWalletList] = useState<any[]>([]);
  const [evmAddress, setEvmAddress] = useState<any[]>([]);

  const getWallet = async () => {
    const wallet = await usewallet.getUserWallets();
    const fData = wallet.filter((item) => item.blockchain !== null);
    const currentNetwork = await usewallet.getNetwork();
    let sortData = fData;
    if (!Array.isArray(sortData)) {
      sortData = [];
    }
    const filteredData = (sortData || []).filter((wallet, index) => {
      return wallet.chain_id == currentNetwork;
    });
    const walletData = (filteredData || []).map((wallet, index) => {
      return {
        id: index,
        name: '',
        address: withPrefix(wallet.blockchain[0].address),
        key: index,
      };
    });
    if (currentNetwork === 'previewnet' && walletData[0].address) {
      usewallet.queryEvmAddress(walletData[0].address).then((res) => {
        const evmData = walletData[0]
        evmData.address = res;
        setEvmAddress([evmData]);
      }).catch((err) => {
        console.log('evm error ', err)
      });
    }
    const childresp: ChildAccount = await usewallet.checkUserChildAccount();
    const cAccountArray = convertObjectToContactArray(childresp)
    const wdArray = await convertArrayToContactArray(walletData)
    console.log('childresp ', wdArray)
    setChildAccount(cAccountArray);
    
    // putDeviceInfo(fData);
    await setWalletList(wdArray);

  }

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
        value: data[address].description
      }
    }));
  }

  async function convertArrayToContactArray(array) {
    const emojiList = await usewallet.getEmoji();
    console.log('emojiList ', emojiList)
    return array.map((item, index) => ({
      id: item.id,
      contact_name: emojiList[0].name,
      username: emojiList[0].name,
      avatar: emojiList[0].emoji,
      address: item.address,
      contact_type: 1,
      bgColor:emojiList[0].bgcolor,
      domain: {
        domain_type: 0,
        value: ''
      }
    }));
  }




  useEffect(() => {
    const group = groupBy(
      filteredContacts,
      (contact) => contact.contact_name[0]
    );
    setGrouped(group);
    getWallet();
  }, [filteredContacts]);

  const history = useHistory();

  return (
    <Box sx={{ height: '100%' }}>
      {!isEmpty(walletList) && (
        walletList.map((eachgroup, index) => (
          <List
            dense={false}
            sx={{ paddingTop: '0px', paddingBottom: '0px' }}
            key={index}
          >
            <Box>
              <ButtonBase
                key={`card-${index}`}
                sx={{ display: 'contents' }}
                onClick={() =>
                  handleClick(eachgroup)
                }
              >
                <FWContactCard
                  contact={eachgroup}
                  hideCloseButton={true}
                  key={index}
                />
              </ButtonBase>
            </Box>
          </List>
        ))
      )}
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
      {!isEmpty(evmAddress) && (
        evmAddress.map((eachgroup, index) => (
          <List
            dense={false}
            sx={{ paddingTop: '0px', paddingBottom: '0px' }}
            key={index}
          >
            <Box>
              <ButtonBase
                key={`card-${index}`}
                sx={{ display: 'contents' }}
                onClick={() =>
                  handleClick(eachgroup)
                }
              >
                <LLContactCard
                  contact={eachgroup}
                  hideCloseButton={true}
                  key={index}
                />
              </ButtonBase>
            </Box>
          </List>
        ))
      )}

      {!isEmpty(childAccounts) && (
        childAccounts.map((eachgroup, index) => (
          <List
            dense={false}
            sx={{ paddingTop: '0px', paddingBottom: '0px' }}
            key={index}
          >
            <Box>
              <ButtonBase
                key={`card-${index}`}
                sx={{ display: 'contents' }}
                onClick={() =>
                  handleClick(eachgroup)
                }
              >
                <LLContactCard
                  contact={eachgroup}
                  hideCloseButton={true}
                  key={index}
                />
              </ButtonBase>
            </Box>
          </List>
        ))
      )}
    </Box>
  );
};

export default AccountsList;

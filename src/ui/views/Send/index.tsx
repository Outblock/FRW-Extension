import { ChangeHistory } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  InputBase,
  Tab,
  Tabs,
  Typography,
  InputAdornment,
  Input,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme, styled, StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { isEmpty } from 'lodash';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';

import { type Contact } from '@/shared/types/network-types';
import { withPrefix, isValidEthereumAddress, isValidFlowAddress } from '@/shared/utils/address';
import { useContactHook } from '@/ui/hooks/useContactHook';
import { useContactStore } from '@/ui/stores/contactStore';
import { useTransactionStore } from '@/ui/stores/transactionStore';
import { useWallet } from 'ui/utils';

import IconAbout from '../../../components/iconfont/IconAbout';

import AccountsList from './AddressLists/AccountsList';
import AddressBookList from './AddressLists/AddressBookList';
import RecentList from './AddressLists/RecentList';
import SearchList from './AddressLists/SearchList';

export enum SendPageTabOptions {
  Recent = 'Recent',
  AddressBook = 'AddressBook',
  Accounts = 'Accounts',
}

const useStyles = makeStyles((theme) => ({
  page: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  inputWrapper: {
    paddingLeft: '18px',
    paddingRight: '18px',
    width: '100%',
  },
  inputBox: {
    minHeight: '56px',
    // borderRadius: theme.spacing(2),
    backgroundColor: '#282828',
    zIndex: '999',
    // width: '100%',
    borderRadius: '16px',
    boxSizing: 'border-box',
    // margin: '2px 18px 10px 18px',
    width: '100%',
    padding: '0px 16px',
  },
  listWrapper: {
    flexGrow: 1,
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'column',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

const searchResult = {
  address: '',
  contact_name: '',
  avatar: '',
  domain: {
    domain_type: 0,
    value: '',
  },
} as Contact;

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`accounts-tabpanel-${index}`}
      aria-labelledby={`accounts-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `accounts-tab-${index}`,
    'aria-controls': `accounts-tabpanel-${index}`,
  };
};

const Send = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const usewallet = useWallet();
  const transactionStore = useTransactionStore();
  const {
    filteredContacts,
    searchContacts,
    recentContacts,
    sortedContacts,
    hasNoFilteredContacts,
    setFilteredContacts,
    setSearchContacts,
    setHasNoFilteredContacts,
  } = useContactStore();
  const { fetchAddressBook } = useContactHook();

  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchKey, setSearchKey] = useState<string>('');
  const [searched, setSearched] = useState<boolean>(false);

  const mounted = useRef(false);

  const checkContain = (searchResult: Contact) => {
    if (sortedContacts.some((e) => e.contact_name === searchResult.username)) {
      return true;
    }
    return false;
  };

  const searchUser = async () => {
    let result = await usewallet.openapi.searchUser(searchKey);
    result = result.data.users;
    const fArray = searchContacts;
    const reg = /^((0x))/g;
    const lilicoResult = {
      address: '',
      contact_name: '',
      avatar: '',
      domain: {
        domain_type: 0,
        value: '',
      },
    } as Contact;
    if (result) {
      result.map((data) => {
        let address = data.address;
        if (!reg.test(data.address)) {
          address = '0x' + data.address;
        }
        lilicoResult['group'] = 'Flow Wallet user';
        lilicoResult.address = address;
        lilicoResult.contact_name = data.username;
        lilicoResult.domain!.domain_type = 999;
        lilicoResult.avatar = data.avatar;
        lilicoResult.type! = checkContain(data) ? 1 : 4;
        fArray.push(lilicoResult);
      });
      setSearchContacts(fArray);
    }
    return;
  };
  const searchAll = async () => {
    // await resetSearch();
    setSearching(true);
    setIsLoading(true);
    await searchUser();
    // await searchUser();
    setHasNoFilteredContacts(false);
    setSearched(true);
    setIsLoading(false);
  };

  const checkKey = async (e) => {
    if (e.code === 'Enter') {
      searchAll();
    }
  };

  const handleFilterAndSearch = async (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearched(false);
    const keyword = e.target.value;
    setSearching(true);
    await setSearchKey(keyword);
    if (keyword.length === 0) {
      setSearching(false);
    }

    const filtered = sortedContacts.filter((item) => {
      for (const key in item) {
        if (typeof item[key] === 'string') {
          if (item[key].includes(keyword)) return true;
        }
      }
      if (item.domain?.value.includes(keyword)) return true;
      return false;
    });

    const checkAddress = keyword.trim();
    if (isValidFlowAddress(checkAddress) || isValidEthereumAddress(checkAddress)) {
      const checkedAdressContact = searchResult;
      checkedAdressContact.address = checkAddress;

      handleTransactionRedirect(checkedAdressContact);
    }
    setFilteredContacts(filtered);
    setHasNoFilteredContacts(isEmpty(filtered));
    console.log('recentContacts', filtered);
  };

  const handleTransactionRedirect = (contact: Contact) => {
    const isEvmAddress = isValidEthereumAddress(contact.address);
    const pathname = `/dashboard/wallet/send/${contact.address}`;

    // Set transaction destination network and address
    useTransactionStore.getState().setToNetwork(isEvmAddress ? 'Evm' : 'Cadence');
    useTransactionStore.getState().setToAddress(contact.address);

    history.push({
      pathname,
      state: { contact },
    });
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      fetchAddressBook();
    }
  }, [fetchAddressBook]);

  return (
    <StyledEngineProvider injectFirst>
      <div className={`${classes.page} page`}>
        <Grid
          container
          sx={{
            justifyContent: 'start',
            alignItems: 'center',
            px: '8px',
          }}
        >
          <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton onClick={() => history.push('/dashboard')}>
              <ArrowBackIcon sx={{ color: 'icon.navi' }} />
            </IconButton>
          </Grid>
          <Grid item xs={10}>
            <Typography variant="h1" align="center" py="14px" fontWeight="bold" fontSize="20px">
              {chrome.i18n.getMessage('Send_to')}
            </Typography>
          </Grid>
          <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton onClick={() => window.open('https://usewallet.flow.com/contact', '_blank')}>
              <Tooltip title={chrome.i18n.getMessage('Need__Help')} arrow>
                <HelpOutlineRoundedIcon sx={{ color: 'icon.navi' }} />
              </Tooltip>
            </IconButton>
          </Grid>
        </Grid>
        <div className={classes.inputWrapper}>
          <Input
            type="search"
            className={classes.inputBox}
            placeholder={chrome.i18n.getMessage('Search__PlaceHolder')}
            autoFocus
            disableUnderline
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon color="primary" sx={{ ml: '10px', my: '5px', fontSize: '24px' }} />
              </InputAdornment>
            }
            onChange={handleFilterAndSearch}
            onKeyDown={checkKey}
          />
        </div>

        {!searching ? (
          <div className={classes.listWrapper}>
            <Tabs
              value={tabValue}
              sx={{ width: '100%' }}
              onChange={(_, newValue: number) => setTabValue(newValue)}
              TabIndicatorProps={{
                style: {
                  backgroundColor: '#5a5a5a',
                },
              }}
              variant="fullWidth"
              aria-label="accounts tabs"
            >
              {Object.values(SendPageTabOptions).map((option, index) => {
                return (
                  <Tab
                    label={
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          textTransform: 'capitalize',
                          fontSize: '14px',
                          fontWeight: 'semi-bold',
                        }}
                      >
                        {chrome.i18n.getMessage(option)}
                      </Typography>
                    }
                    key={option}
                    style={{ color: '#F9F9F9' }}
                    {...a11yProps(index)}
                  />
                );
              })}
            </Tabs>
            <Box
              sx={{
                width: '100%',
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'scroll',
                backgroundColor: '#000000',
                flexGrow: 1,
              }}
            >
              <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={tabValue}
                onChangeIndex={(index: number) => setTabValue(index)}
                style={{ height: '100%', width: '100%' }}
              >
                <TabPanel value={tabValue} index={0} dir={theme.direction}>
                  <RecentList
                    filteredContacts={recentContacts}
                    isLoading={isLoading}
                    handleClick={handleTransactionRedirect}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={1} dir={theme.direction}>
                  <AddressBookList
                    filteredContacts={filteredContacts}
                    isLoading={isLoading}
                    handleClick={handleTransactionRedirect}
                  />
                </TabPanel>
                <TabPanel value={tabValue} index={2} dir={theme.direction}>
                  <AccountsList
                    filteredContacts={filteredContacts}
                    isLoading={isLoading}
                    handleClick={handleTransactionRedirect}
                  />
                </TabPanel>
              </SwipeableViews>
            </Box>
          </div>
        ) : (
          <div>
            {!searched && (
              <ListItem
                sx={{
                  marginTop: '10px',
                  marginBottom: '10px',
                  paddingTop: '0px',
                  paddingBottom: '0px',
                  cursor: 'pointer',
                }}
                onClick={searchAll}
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: '40px', height: '40px' }} />
                </ListItemAvatar>
                <ListItemText>
                  <Typography sx={{ display: 'inline' }} component="span" variant="body2">
                    {chrome.i18n.getMessage('Search_the_ID')}
                  </Typography>
                  <Typography
                    sx={{ display: 'inline', textDecoration: 'underline' }}
                    component="span"
                    variant="body2"
                    color="primary"
                  >
                    {searchKey}
                  </Typography>
                </ListItemText>
              </ListItem>
            )}

            {!searched && !hasNoFilteredContacts && (
              <AddressBookList
                filteredContacts={filteredContacts}
                isLoading={isLoading}
                handleClick={handleTransactionRedirect}
              />
            )}

            {searched && !searchContacts.length && (
              <ListItem sx={{ backgroundColor: '#000000' }}>
                <ListItemAvatar sx={{ marginRight: '8px', minWidth: '20px' }}>
                  <IconAbout size={20} color="#E54040" />
                </ListItemAvatar>
                <ListItemText>
                  <Typography
                    sx={{ display: 'inline', fontSize: '14px' }}
                    component="span"
                    color="#BABABA"
                  >
                    {chrome.i18n.getMessage(
                      'Sorry_we_could_not_find_any_accounts_Please_try_again'
                    )}
                  </Typography>
                </ListItemText>
              </ListItem>
            )}
            {searched && !hasNoFilteredContacts && (
              <SearchList
                searchContacts={searchContacts}
                isLoading={isLoading}
                handleClick={handleTransactionRedirect}
              />
            )}
          </div>
        )}
      </div>
    </StyledEngineProvider>
  );
};

export default Send;

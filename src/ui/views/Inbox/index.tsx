import React, {useState, useEffect} from 'react';
import { useHistory } from 'react-router-dom';
import {
  Typography,
  IconButton,
  Box,
  CardMedia,
  Tab,
  Tabs,
} from '@mui/material';
import {
  LLPrimaryButton,
  LLSpinner
} from 'ui/FRWComponent';
import { useTheme } from '@mui/material/styles';
import { useWallet } from 'ui/utils';
import NavBar from '../Dashboard/NavBar';
import SwipeableViews from 'react-swipeable-views';
import { LLHeader } from '@/ui/FRWComponent';
import Token from './Token';
import Nft from './Nft';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}
export enum SendPageTabOptions {
  Recent = 'Token',
  AddressBook = 'NFT',
  // Accounts = 'Accounts',
}
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

const Inbox = () => {

  const wallet = useWallet();
  const [claiming, setClaiming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searchKey, setSearchKey] = useState<string>('');
  const [searchContacts, setSearchContacts] = useState<any[]>([]);
  const [searched, setSearched] = useState<boolean>(false);
  const [hasNoFilteredContacts, setHasNoFilteredContacts] =
    useState<boolean>(false);
  const theme = useTheme();



  const getUsername = async () => {
    const resp =  await wallet.fetchFlownsInbox();
    const userInfo = await wallet.getUserInfo(false);
    const address = await wallet.getCurrentAddress();
    const nftPlaceholder: any[] = [];
    const tokenPlaceholder: any[] = [];
    const collections = resp.collections;
    const vaultBalances = resp.vaultBalances;


    Object.keys(resp.vaultBalances).map((i, v) => {
      const token = {}
      token[i] = vaultBalances[i]

      tokenPlaceholder.push(token);
    });
    await wallet.setHistory(tokenPlaceholder, resp.collections);
    const history = await wallet.getHistory();
    setResult(resp);
    // (Object.keys(resp.collections)).map(async (i: any, v: any) => {
    //   console.log(i);
    //   const token = await wallet.openapi.getNFTMetadata(address!, i.split('.')[2], `0x${i.split('.')[1]}`, resp.collections[i]);
    // });
    setUsername(userInfo.username)
  };

  useEffect(() => {
    getUsername();
  }, []);

  return (
    <div className="page">
      <LLHeader title={chrome.i18n.getMessage('Inbox')}  help={false}/>

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
                  {option}
                </Typography>
              }
              key={option}
              style={{ color: '#F9F9F9' }}
              {...a11yProps(index)}
            />
          );
        })}
      </Tabs>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={tabValue}
        onChangeIndex={(index: number) => setTabValue(index)}
        style={{ height: '100%', width: '100%', background: '#000000' }}
      >
        <TabPanel value={tabValue} index={0}>
          <Token data={result}></Token>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Nft data={result}></Nft>
        </TabPanel>
      </SwipeableViews>
    </div>
  );
};

export default Inbox;

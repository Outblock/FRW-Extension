import { useEffect, useState, useContext } from "react";
import { findAddressWithSeed } from "../AddressImport/findAddressWithPK";
import { KEY_TYPE } from "./constants";
import React from "react";
import { Box, Tabs, Tab, Typography } from '@mui/material';
import SeedPhraseImport from "./importComponent/SeedPhrase";
import KeyImport from "./importComponent/KeyImport";
import JsonImport from "./importComponent/JsonImport";

import ImportAddressModel from "./modal/importAddressModal";

import NoAddressModal from "./modal/noAddressModal";
import { useWallet } from 'ui/utils';
import * as bip39 from 'bip39';
import { storage } from '@/background/webapi';
import CancelIcon from '../../../components/iconfont/IconClose';
import CheckCircleIcon from '../../../components/iconfont/IconCheckmark';
import { Presets } from 'react-component-transition';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ImportPager = ({ setMnemonic, setPk, setAccounts, accounts, handleClick }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isImport, setImport] = useState<any>(false);

  const [helperText, setHelperText] = useState(<div />);

  const [mnemonicValid, setMnemonicValid] = useState(true);

  const [addressFound, setAddressFound] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const wallet = useWallet();

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleImport = async (accountKey?: any) => {
    console.log('account key ', accountKey)
    if (accountKey.length > 1) {
      setAccounts(accountKey);
      setImport(true);
    } else {
      setAccounts(accountKey);
      handleClick();

    }
  };
  const setmnemonic = (mnemonic) => {
    setMnemonic(mnemonic);
    const formatted = mnemonic.trim().split(/\s+/g).join(' ');
    setMnemonicValid(true);
    storage.set('premnemonic', formatted);
  };

  const handleShowModel = (show) => {
    setImport(show)
  };

  const handleAddressSelection = async (address) => {
    console.log("handleAddressSelection ==>", address);
    console.log(
      "handleAddressSelection ==>",
      accounts.filter((account) => account.address === address)[0],
      accounts
    );
    const account = accounts.filter(
      (account) => account.address === address
    )[0];
    console.log("handleAddressSelection ==>", account);
    const result = await wallet.openapi.checkImport(account.pubK);
    setAccounts([account]);
    handleClick();
    console.log("result ==>", result);
  };


  const handleRegister = async () => {
    setAddressFound(!addressFound)
  }


  const sxStyles = {
    fontFamily: 'Inter',
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '24px',
    letterSpacing: '-0.252px',
    textTransform: 'capitalize'
  };

  return (
    <Box sx={{ padding: "0 16px 16px" }}>
      <Box sx={{ padding: '20px 24px' }}>
        <Typography variant="h4">
          Import Address
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Support Flow Wallet, Blocto, seed phrase, keystore and private key
        </Typography>
      </Box>

      <Tabs value={selectedTab} onChange={handleTabChange} aria-label="simple tabs example" sx={{ padding: '0 24px' }}>
        <Tab sx={sxStyles} label="Keystore" />
        <Tab sx={sxStyles} label="Seed Phrase" />
        <Tab sx={sxStyles} label="Private Key" />
      </Tabs>
      <TabPanel value={selectedTab} index={0}>
        <JsonImport onOpen={handleRegister} onImport={handleImport} setPk={setPk} />
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <SeedPhraseImport onOpen={handleRegister} onImport={handleImport} setmnemonic={setmnemonic} />
      </TabPanel>
      <TabPanel value={selectedTab} index={2}>
        <KeyImport onOpen={handleRegister} onImport={handleImport} setPk={setPk} />
      </TabPanel>
      {!addressFound &&
        <NoAddressModal
          isOpen={setAddressFound}
          onOpenChange={setAddressFound}

        />

      }

      {isImport &&
        <ImportAddressModel
          accounts={accounts}
          handleAddressSelection={handleAddressSelection}
          isOpen={handleShowModel}
          onOpenChange={handleShowModel}

        />

      }

    </Box>
  );
};

export default ImportPager;

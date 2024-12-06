import { makeStyles } from '@mui/styles';
import React, { useState, useEffect, useCallback } from 'react';
import { Switch, withRouter, type RouteComponentProps } from 'react-router-dom';

import { PrivateRoute } from 'ui/component';
import { useWallet } from 'ui/utils';

import Deposit from '../views/Deposit';
import Enable from '../views/Enable';
import Send from '../views/Send';
import Swap from '../views/Swap';

import Dashboard from './Dashboard';
import Header from './Dashboard/Header';
import Flowns from './Flowns';
import Inbox from './Inbox';
import CollectionDetail from './NFT/CollectionDetail';
import Detail from './NFT/Detail';
import AddList from './NFT/NFTList/AddList';
import SendToAddress from './NFT/SendNFT/SendToAddress';
import EvmCollectionDetail from './NftEvm/CollectionDetail';
import NftEvmDetail from './NftEvm/Detail';
import SendNftEvm from './NftEvm/SendNFT/SendToAddress';
import SendAmount from './Send/SendAmount';
import SendEth from './Send/SendEth';
import About from './Setting/About/About';
import Account from './Setting/Account';
import AddressBook from './Setting/AddressBook';
import ManageBackups from './Setting/Backups';
import DeveloperMode from './Setting/DeveloperMode/DeveloperMode';
import DeviceInfo from './Setting/Devices/DeviceInfo';
import KeyList from './Setting/KeyList/KeyList';
import Linked from './Setting/Linked';
import LinkedCollection from './Setting/Linked/LinkedCollection';
import LinkedDetail from './Setting/Linked/LinkedDetail';
import LinkedNftDetail from './Setting/Linked/LinkedNftDetail';
import Keydetail from './Setting/privatekey/Keydetail';
import PrivateKeyPassword from './Setting/privatekey/Privatekeypassword';
import RecoveryPhasesDetail from './Setting/recoveryphase/Recoveryphasedetail';
import Recoveryphrasepassword from './Setting/recoveryphase/Recoveryphrasepassword';
import Resetpwd from './Setting/Resetpwd';
import Security from './Setting/Security';
import Settingone from './Setting/Settingone';
import Switchaccount from './Setting/Switchaccount';
import './MainRoute.css';
import WalletList from './Setting/Wallet';
import RemoveWallet from './Setting/Wallet/RemoveWallet';
import WalletDetail from './Setting/Wallet/WalletDetail';
import NodeDetail from './Staking/NodeDetail';
import StakingPage from './Staking/StakingPage';
import UnstakePage from './Staking/UnstakePage';
import TokenDetail from './TokenDetail';
import TokenList from './TokenList';
import AddCustomEvmToken from './Wallet/AddCustom/AddCustomEvmToken';

const useStyles = makeStyles(() => ({
  innerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  mainBody: {
    flex: 1,
    overflowY: 'scroll',
    height: '100%',
  },
}));

const InnerRoute = (props: RouteComponentProps) => {
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const wallet = useWallet();

  const fetch = useCallback(async () => {
    const dashIndex = await wallet.getDashIndex();
    if (dashIndex) {
      setValue(dashIndex);
    } else {
      setValue(0);
      await wallet.setDashIndex(0);
    }
  }, [wallet]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    wallet.setDashIndex(value);
  }, [value, wallet]);

  return (
    <React.Fragment>
      <div className={classes.innerWrapper}>
        <Header />

        <div className="route-wrapper" id="scrollableTab">
          <Switch>
            <PrivateRoute exact path={`${props.match.url}/`}>
              <Dashboard value={value} setValue={setValue} />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/setting/addressbook`}>
              <AddressBook />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/settingone`}>
              <Settingone />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/security`}>
              <Security />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/switchaccount`}>
              <Switchaccount />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/privatekeypassword`}>
              <PrivateKeyPassword />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/keylist`}>
              <KeyList />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/keydetail`}>
              <Keydetail />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/recoveryphrasepassword`}>
              <Recoveryphrasepassword />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/recoveryphrasedetail`}>
              <RecoveryPhasesDetail />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/resetpwd`}>
              <Resetpwd />
            </PrivateRoute>
            <PrivateRoute
              path={`${props.match.url}/nested/collectiondetail/:collection_address_name`}
            >
              <CollectionDetail />
            </PrivateRoute>
            <PrivateRoute
              path={`${props.match.url}/nested/evm/collectiondetail/:collection_address_name`}
            >
              <EvmCollectionDetail />
            </PrivateRoute>
            <PrivateRoute
              path={`${props.match.url}/nested/linked/collectiondetail/:collection_address_name`}
            >
              <LinkedCollection />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/nftdetail/:id`}>
              <Detail />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/linkednftdetail/:id`}>
              <LinkedNftDetail />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nft/send`}>
              <SendToAddress />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nftevm/detail/:id`}>
              <NftEvmDetail />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nftevm/send`}>
              <SendNftEvm />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/wallet/send`}>
              <Send />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/wallet/swap`}>
              <Swap />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/wallet/deposit`}>
              <Deposit />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/wallet/sendAmount`}>
              <SendAmount />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/wallet/sendeth`}>
              <SendEth />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/token/:id`}>
              <TokenDetail />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/tokenlist`}>
              <TokenList />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/addcustomevm`}>
              <AddCustomEvmToken />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/nested/add_list`}>
              <AddList />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/setting/about`}>
              <About />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/setting/linked`}>
              <Linked />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/setting/linkeddetail/:key`}>
              <LinkedDetail />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/setting/developerMode`}>
              <DeveloperMode />
            </PrivateRoute>

            <PrivateRoute path={`${props.match.url}/setting/deviceinfo`}>
              <DeviceInfo />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/setting/wallet/detail`}>
              <WalletDetail />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/setting/wallet`}>
              <WalletList />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/setting/removeWallet`}>
              <RemoveWallet />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/setting/account`}>
              <Account />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/setting/backups`}>
              <ManageBackups />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/flowns`}>
              <Flowns />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/enable`}>
              <Enable />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/inbox`}>
              <Inbox />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/staking/page/:nodeid/:delegateid`}>
              <StakingPage />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/unstake/page/:nodeid/:delegateid`}>
              <UnstakePage />
            </PrivateRoute>
            <PrivateRoute path={`${props.match.url}/staking/node/:nodeid/:delegateid`}>
              <NodeDetail />
            </PrivateRoute>
          </Switch>
        </div>
      </div>
    </React.Fragment>
  );
};

export default withRouter(InnerRoute);

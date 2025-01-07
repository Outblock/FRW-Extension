import { CssBaseline } from '@mui/material';
import GlobalStyles from '@mui/material/GlobalStyles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useEffect } from 'react';
import { HashRouter as Router, Route, useLocation } from 'react-router-dom';

import { useCoinHook } from '@/ui/hooks/useCoinHook';
import { useNetworkHook } from '@/ui/hooks/useNetworkHook';
import { useProfileHook } from '@/ui/hooks/useProfileHook';
import themeOptions from '@/ui/style/LLTheme';
import { NewsProvider } from '@/ui/utils/NewsContext';
import { PrivateRoute } from 'ui/component';
import { WalletProvider, useWallet } from 'ui/utils';

import Approval from './Approval';
import InnerRoute from './InnerRoute';
import { Landing } from './Landing';
import RetrievePK from './RetrievePK';
import SortHat from './SortHat';
import SwitchUnlock from './SwitchUnlock';
import Unlock from './Unlock';

const theme = createTheme(themeOptions);

const Routes = () => {
  const location = useLocation();
  const wallet = useWallet();

  React.useEffect(() => {
    wallet.trackPageView(location.pathname);
  }, [location, wallet]);

  return (
    <>
      <Route exact path="/">
        <SortHat />
      </Route>
      <Route exact path="/unlock" component={Unlock} />
      <Route exact path="/switchunlock" component={SwitchUnlock} />
      <Route exact path="/retrieve" component={RetrievePK} />
      <Landing />
      <Route path="/dashboard">
        <InnerRoute />
      </Route>
      <PrivateRoute path="/approval">
        <Approval />
      </PrivateRoute>
    </>
  );
};

function Main() {
  const { fetchProfileData, freshUserWallet, fetchUserWallet } = useProfileHook();
  const { fetchNetwork } = useNetworkHook();
  const { refreshCoinData } = useCoinHook();

  useEffect(() => {
    // Fetch initial data
    const initData = async () => {
      await fetchNetwork();
      await fetchProfileData();
      await freshUserWallet();
      await fetchUserWallet();
      await refreshCoinData();
    };

    initData();
  }, [fetchProfileData, freshUserWallet, refreshCoinData, fetchNetwork, fetchUserWallet]);

  return (
    <Router>
      <Routes />
    </Router>
  );
}

const App = ({ wallet }: { wallet: any }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WalletProvider wallet={wallet}>
        <NewsProvider>
          <Main />
        </NewsProvider>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;

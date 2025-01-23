import { CssBaseline } from '@mui/material';
import GlobalStyles from '@mui/material/GlobalStyles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useEffect } from 'react';
import { HashRouter as Router, Route, useLocation } from 'react-router-dom';

import { useInitHook } from '@/ui/hooks';
import themeOptions from '@/ui/style/LLTheme';
import { NewsProvider } from '@/ui/utils/NewsContext';
import { PrivateRoute } from 'ui/component';
import { WalletProvider, useWallet } from 'ui/utils';

// Uncomment this when we need to test api-test
// import ApiTestPage from './api-test/api-test-page';
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
      {/* uncomment this when we need to test api-test */}
      {/* <PrivateRoute path="/api-test">
        <ApiTestPage />
      </PrivateRoute> */}
    </>
  );
};

function Main() {
  const { initializeStore } = useInitHook();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);
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

import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';
import { createMemoryHistory } from 'history';
import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import { NewsProvider } from '@/ui/utils/NewsContext';
import { PrivateRoute } from 'ui/component';
import { WalletProvider, mixpanelBrowserService } from 'ui/utils';

import theme from '../style/LLTheme';

import Approval from './Approval';
import InnerRoute from './InnerRoute';
import RetrievePK from './RetrievePK';
import SortHat from './SortHat';
import SwitchUnlock from './SwitchUnlock';
import Unlock from './Unlock';

const AsyncMainRoute = lazy(() => import('./MainRoute'));

// import Reset from './Reset';

function Main() {
  React.useEffect(() => {
    // Initialize mixpanel in the popup
    // Note: Mixpanel is initialized in the constructor, just calling init here to make sure it is initialized
    mixpanelBrowserService.init();
  }, []);

  return (
    //@ts-ignore
    <Router history={createMemoryHistory}>
      <Route exact path="/">
        <SortHat />
      </Route>
      {/* <Route exact path="/reset" component={Reset} /> */}
      <Route exact path="/unlock" component={Unlock} />
      <Route exact path="/switchunlock" component={SwitchUnlock} />
      <Route exact path="/retrieve" component={RetrievePK} />
      <Suspense fallback={null}>
        <AsyncMainRoute />
      </Suspense>
      <Route path="/dashboard">
        <InnerRoute />
      </Route>
      <PrivateRoute path="/approval">
        <Approval />
      </PrivateRoute>
    </Router>
  );
}

const App = ({ wallet }: { wallet: any }) => {
  return (
    <ThemeProvider theme={theme}>
      <WalletProvider wallet={wallet}>
        <NewsProvider>
          <GlobalStyles
            styles={{
              body: { backgroundColor: '#121212' },
            }}
          />
          <Main />
        </NewsProvider>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;

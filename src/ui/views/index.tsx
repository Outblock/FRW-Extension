import { CssBaseline } from '@mui/material';
import GlobalStyles from '@mui/material/GlobalStyles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import themeOptions from '@/ui/style/LLTheme';
import { NewsProvider } from '@/ui/utils/NewsContext';
import { PrivateRoute } from 'ui/component';
import { WalletProvider } from 'ui/utils';

import Approval from './Approval';
import InnerRoute from './InnerRoute';
import { MainRoute } from './MainRoute';
import RetrievePK from './RetrievePK';
import SortHat from './SortHat';
import SwitchUnlock from './SwitchUnlock';
import Unlock from './Unlock';

const theme = createTheme(themeOptions);

function Main() {
  return (
    //@ts-ignore
    <Router>
      <Route exact path="/">
        <SortHat />
      </Route>
      {/* <Route exact path="/reset" component={Reset} /> */}
      <Route exact path="/unlock" component={Unlock} />
      <Route exact path="/switchunlock" component={SwitchUnlock} />
      <Route exact path="/retrieve" component={RetrievePK} />
      <MainRoute />
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
  console.log('Theme:', theme); // Add this to debug

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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

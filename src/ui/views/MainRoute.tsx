import React from 'react';
import { Switch, Route } from 'react-router-dom';

import AddressImport from './AddressImport';
import GoogleImport from './AddressImport/GoogleImport';
import AddWelcome from './AddWelcome';
import AddRegister from './AddWelcome/AddRegister';
import AddImport from './AddWelcome/AddressImport';
import AddGoogle from './AddWelcome/AddressImport/GoogleImport';
import AddSync from './AddWelcome/Sync';
// import ProxySync from './AddWelcome/ProxySync';
import Forgot from './Forgot';
import Recover from './Forgot/Recover';
import Reset from './Forgot/Reset';
import RecoverRegister from './RecoverRegister';
import RegisterPager from './Register/RegisterPager';
import Synce from './Sync';
import WelcomePage from './WelcomePage';

import './MainRoute.css';

const LogPageView = () => {
  return null;
};

export const MainRoute: React.FC = () => {
  return (
    <div style={{ display: 'contents' }}>
      <Route path="/" component={LogPageView} />
      <Switch>
        <Route exact path="/welcome" component={WelcomePage} />
        <Route exact path="/register" component={RegisterPager} />
        <Route exact path="/sync" component={Synce} />
        <Route exact path="/addressimport" component={AddressImport} />
        <Route exact path="/recover" component={RecoverRegister} />
        <Route exact path="/addregister" component={AddRegister} />
        {/* <Route exact path="/proxysync" component={ProxySync} /> */}
        <Route exact path="/addimport" component={AddImport} />
        <Route exact path="/addsync" component={AddSync} />
        <Route exact path="/addwelcome" component={AddWelcome} />
        <Route exact path="/forgot" component={Forgot} />
        <Route exact path="/recoverpage" component={Recover} />
        <Route exact path="/resetpage" component={Reset} />
        <Route exact path="/reset" component={WelcomePage} />
        <Route exact path="/import/google" component={GoogleImport} />
        <Route exact path="/add/google" component={AddGoogle} />
        <Route exact path="/import/accounts" component={GoogleImport} />
      </Switch>
    </div>
  );
};

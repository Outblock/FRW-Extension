import React from 'react';
import { Switch, Route } from 'react-router-dom';

import AddressImport from './LandingPages//AddressImport';
import GoogleImport from './LandingPages/AddressImport/GoogleImport';
import AddWelcome from './LandingPages/AddWelcome';
import AddRegister from './LandingPages/AddWelcome/AddRegister';
import AddImport from './LandingPages/AddWelcome/AddressImport';
import AddGoogle from './LandingPages/AddWelcome/AddressImport/GoogleImport';
import AddSync from './LandingPages/AddWelcome/Sync';
// import ProxySync from './AddWelcome/ProxySync';
import Forgot from './LandingPages/Forgot';
import Recover from './LandingPages/Forgot/Recover';
import Reset from './LandingPages/Forgot/Reset';
import RecoverRegister from './LandingPages/RecoverRegister';
import Register from './LandingPages/Register';
import Synce from './LandingPages/Sync';
import WelcomePage from './LandingPages/WelcomePage';

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
        <Route exact path="/register" component={Register} />
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

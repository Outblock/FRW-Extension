import React from 'react';
import { Switch, Route } from 'react-router-dom';

import AddWelcome from './LandingPages/AddAccountPage';
import AddRegister from './LandingPages/AddAccountPage/AddRegister';
import AddImport from './LandingPages/AddAccountPage/AddressImport';
import AddGoogle from './LandingPages/AddAccountPage/GoogleImport';
import AddSync from './LandingPages/AddAccountPage/Sync';
// import ProxySync from './AddWelcome/ProxySync';
import Forgot from './LandingPages/Forgot';
import Recover from './LandingPages/Forgot/Recover';
import Reset from './LandingPages/Forgot/Reset';
import RecoverRegister from './LandingPages/RecoverRegister';
import WelcomePage from './LandingPages/WelcomePage';
import AddressImport from './LandingPages/WelcomePage/AddressImport';
import GoogleImport from './LandingPages/WelcomePage/GoogleImport';
import Register from './LandingPages/WelcomePage/Register';
import Synce from './LandingPages/WelcomePage/Sync';

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

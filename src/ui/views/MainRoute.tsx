import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Forgot from './LandingPages/Forgot';
import Recover from './LandingPages/Forgot/Recover';
import Reset from './LandingPages/Forgot/Reset';
import RecoverRegister from './LandingPages/RecoverRegister';
import Welcome from './LandingPages/Welcome';
import AddressImport from './LandingPages/Welcome/AddressImport';
import Google from './LandingPages/Welcome/AddressImport/Google';
import Register from './LandingPages/Welcome/Register';
import Sync from './LandingPages/Welcome/Sync';

import './MainRoute.css';

const LogPageView = () => {
  return null;
};

export const MainRoute: React.FC = () => {
  return (
    <div style={{ display: 'contents' }}>
      <Route path="/" component={LogPageView} />
      <Switch>
        <Route exact path="/welcome" component={Welcome} />
        <Route exact path="/welcome/register" component={Register} />
        <Route exact path="/welcome/addressimport" component={AddressImport} />
        <Route exact path="/welcome/sync" component={Sync} />
        <Route exact path="/forgot" component={Forgot} />
        <Route exact path="/recoverpage" component={Recover} />
        <Route exact path="/resetpage" component={Reset} />
        <Route exact path="/welcome/addressimport/google" component={Google} />
        <Route exact path="/recover" component={RecoverRegister} />
      </Switch>
    </div>
  );
};

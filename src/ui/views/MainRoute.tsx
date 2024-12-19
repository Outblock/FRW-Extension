import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Forgot from './LandingPages/Forgot';
import Recover from './LandingPages/Forgot/Recover';
import Reset from './LandingPages/Forgot/Reset';
import RecoverRegister from './LandingPages/RecoverRegister';
import Welcome from './LandingPages/Welcome';
import AccountImport from './LandingPages/Welcome/AccountImport';
import Google from './LandingPages/Welcome/AccountImport/Google';
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
        <Route exact path="/welcome/accountimport" component={AccountImport} />
        <Route exact path="/welcome/sync" component={Sync} />
        <Route exact path="/forgot" component={Forgot} />
        <Route exact path="/recoverpage" component={Recover} />
        <Route exact path="/resetpage" component={Reset} />
        <Route exact path="/welcome/accountimport/google" component={Google} />
        <Route exact path="/recover" component={RecoverRegister} />
      </Switch>
    </div>
  );
};

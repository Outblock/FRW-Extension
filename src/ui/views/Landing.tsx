import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Forgot from './Forgot';
import Recover from './Forgot/Recover';
import Reset from './Forgot/Reset';
import Welcome from './Welcome';
import AccountImport from './Welcome/AccountImport';
import Google from './Welcome/AccountImport/Google';
import Register from './Welcome/Register';
import Sync from './Welcome/Sync';

import './Landing.css';

const LogPageView = () => {
  return null;
};

export const Landing: React.FC = () => {
  return (
    <div style={{ display: 'contents' }}>
      <Route path="/" component={LogPageView} />
      <Switch>
        <Route exact path="/welcome" component={Welcome} />
        <Route exact path="/welcome/register" component={Register} />
        <Route exact path="/welcome/accountimport" component={AccountImport} />
        <Route exact path="/welcome/sync" component={Sync} />
        <Route exact path="/forgot" component={Forgot} />
        <Route exact path="/forgot/recover" component={Recover} />
        <Route exact path="/forgot/reset" component={Reset} />
        <Route exact path="/welcome/accountimport/google" component={Google} />
      </Switch>
    </div>
  );
};

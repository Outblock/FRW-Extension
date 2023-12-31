import React from 'react';
import { Switch, Route } from 'react-router-dom';
import RegisterPager from './Register/RegisterPager';
import RecoverRegister from './RecoverRegister';
import ImportPager from './Import/ImportPager';
import GoogleImport from './Import/GoogleImport';
import Reset from './Reset';
import WelcomePage from './WelcomePage';
import './MainRoute.css';
import { spring, AnimatedSwitch } from 'react-router-transition';

// eslint-disable-next-line @typescript-eslint/no-empty-function

const LogPageView = () => {
  return null;
};

function mapStyles(styles) {
  return {
    opacity: styles.opacity,
    transform: `scale(${styles.scale})`,
  };
}

// wrap the `spring` helper to use a bouncy config
function bounce(val) {
  return spring(val, {
    stiffness: 33,
    damping: 22,
  });
}

// child matches will...
const bounceTransition = {
  // start in a transparent, upscaled state
  atEnter: {
    opacity: 0.5,
    // offset: 10,
    scale: 1.05,
  },
  // leave in a transparent, downscaled state
  atLeave: {
    opacity: bounce(0.5),
    // offset: 10,
    scale: bounce(0.95),
  },
  // and rest at an opaque, normally-scaled state
  atActive: {
    opacity: 1,
    // offset: 0,
    scale: bounce(1),
  },
};

const Main = () => {
  return (
    <div style={{ display: 'contents' }}>
      <Route path="/" component={LogPageView} />
      <AnimatedSwitch
        atEnter={bounceTransition.atEnter}
        atLeave={bounceTransition.atLeave}
        atActive={bounceTransition.atActive}
        mapStyles={mapStyles}
        className="switch-wrapper"
      >
        <Switch>
          <Route exact path="/welcome" component={WelcomePage} />
          <Route exact path="/register" component={RegisterPager} />
          <Route exact path="/recover" component={RecoverRegister} />
          <Route exact path="/import" component={ImportPager} />
          <Route exact path="/reset" component={Reset} />
          <Route exact path="/import/google" component={GoogleImport} />
          <Route exact path="/import/accounts" component={GoogleImport} />
        </Switch>
      </AnimatedSwitch>
    </div>
  );
};

export default Main;

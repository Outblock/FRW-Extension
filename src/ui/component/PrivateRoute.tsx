import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Route, Redirect } from 'react-router-dom';
import { useWallet } from 'ui/utils';

const PrivateRoute = ({ children, ...rest }) => {
  const wallet = useWallet();
  const history = useHistory();

  // useEffect(() => {
  //   getLockState()
  // }, []);

  // const getLockState = async () => {
  //   const unlocked = await wallet.isUnlocked();
  //   if (!unlocked) {
  //     console.log('getLockState ==>', unlocked, children, rest.path);
  //     history.push('/unlock');
  //   }
  // };

  return (
    <Route
      {...rest}
      render={() => {
        const to = !wallet.isBooted()
          ? '/welcome'
          : !wallet.isUnlocked()
            ? '/unlock'
            : null;
        return !to ? children : <Redirect to={to} />;
      }}
    />
  );
};

export default PrivateRoute;

import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';

import { useWallet } from 'ui/utils';

const PrivateRoute = ({ children, ...rest }) => {
  const wallet = useWallet();
  const [booted, setBooted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Everything through the wallet controller is async, so we need to check if the wallet is booted and unlocked in a useEffect
  useEffect(() => {
    let mounted = true;

    const fetchLockState = async () => {
      const booted = await wallet.isBooted();

      if (!booted) {
        return { booted, unlocked: false };
      } else {
        const unlocked = await wallet.isUnlocked();
        return { booted, unlocked };
      }
    };

    fetchLockState().then(({ booted, unlocked }) => {
      if (mounted) {
        setBooted(booted);
        setUnlocked(unlocked);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [wallet]);

  return (
    <Route
      {...rest}
      render={() => {
        if (loading) {
          return null;
        }
        const to = !booted ? '/welcome' : !unlocked ? '/unlock' : null;
        return !to ? children : <Redirect to={to} />;
      }}
    />
  );
};

export default PrivateRoute;

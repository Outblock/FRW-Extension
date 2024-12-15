import React from 'react';

import { WelcomePage } from '@/ui/FRWComponent/LandingPages';

const Welcome = () => {
  return (
    <WelcomePage
      registerPath="/welcome/register"
      syncPath="/welcome/sync"
      importPath="/welcome/addressimport"
    />
  );
};

export default Welcome;

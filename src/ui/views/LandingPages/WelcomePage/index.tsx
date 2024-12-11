import React from 'react';

import { WelcomePage as WelcomeComponent } from '@/ui/FRWComponent/LandingPages';

const WelcomePage = () => {
  return <WelcomeComponent registerPath="/register" syncPath="/sync" importPath="/addressimport" />;
};

export default WelcomePage;

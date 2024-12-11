import React from 'react';

import { WelcomePage as WelcomeComponent } from '@/ui/FRWComponent/MainPages';

const WelcomePage = () => {
  return <WelcomeComponent registerPath="/register" syncPath="/sync" importPath="/addressimport" />;
};

export default WelcomePage;

import React from 'react';

import { WelcomePage } from '@/ui/FRWComponent/LandingPages';

const AddWelcome = () => {
  return <WelcomePage registerPath="/addregister" syncPath="/addsync" importPath="/addimport" />;
};

export default AddWelcome;

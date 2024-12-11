import { Box } from '@mui/material';
import React from 'react';

export interface PageConfig {
  component: React.ComponentType<any>;
  props: Record<string, any>;
}

export const getPageConfig = (pages: Record<number, PageConfig>, index: number): PageConfig => {
  return pages[index] || { component: () => React.createElement(Box), props: {} };
};

export const renderPage = (pages: Record<number, PageConfig>, index: number): JSX.Element => {
  const pageConfig = getPageConfig(pages, index);
  const Comp = pageConfig.component;
  return React.createElement(Comp, pageConfig.props);
};

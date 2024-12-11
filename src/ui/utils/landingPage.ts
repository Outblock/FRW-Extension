import { Box } from '@mui/material';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

export interface PageConfig {
  component: React.ComponentType<any>;
  props: Record<string, any>;
}

export enum Direction {
  Right,
  Left,
}

export const getPageConfig = (pages: Record<number, PageConfig>, index: number): PageConfig => {
  return pages[index] || { component: () => React.createElement(Box), props: {} };
};

export const renderPage = (pages: Record<number, PageConfig>, index: number): JSX.Element => {
  const pageConfig = getPageConfig(pages, index);
  const Comp = pageConfig.component;
  return React.createElement(Comp, pageConfig.props);
};

export const getDirectionType = (direction: Direction) => {
  return direction === Direction.Left ? 'left' : 'right';
};

export const useNavigation = (maxSteps: number) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(Direction.Right);
  const history = useHistory();

  const goNext = () => {
    setDirection(Direction.Right);
    if (activeIndex < maxSteps) {
      setActiveIndex(activeIndex + 1);
    } else {
      window.close();
    }
  };

  const goBack = () => {
    setDirection(Direction.Left);
    if (activeIndex >= 1) {
      setActiveIndex(activeIndex - 1);
    } else {
      history.goBack();
    }
  };

  const goCustom = (index: number) => {
    setDirection(Direction.Right);
    setActiveIndex(index);
  };

  return {
    activeIndex,
    direction: getDirectionType(direction),
    goNext,
    goBack,
    goCustom,
  };
};

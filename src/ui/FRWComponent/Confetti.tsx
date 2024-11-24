import React, { useCallback } from 'react';
import Particles, { type IParticlesProps } from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const CONFETTI_OPTIONS: IParticlesProps['options'] = {
  fullScreen: true,
  fpsLimit: 120,
  detectRetina: true,
  emitters: [
    {
      direction: 'bottom',
      startCount: 0,
      position: { x: 50, y: 0 },
      size: {
        width: 20,
        height: 0,
      },
      rate: {
        delay: 0,
        quantity: 2,
      },
      life: {
        count: 200,
        duration: 0.01,
        // delay:0.6,
      },
    },
  ],
  particles: {
    number: {
      value: 250,
    },
    color: {
      value: ['#9146FF', '#FFAAA8', '#8FFFD2', '#FFD37A', '#FF38DB'],
    },
    shape: {
      type: ['square', 'circle', 'heart'],
    },
    opacity: {
      value: 1,
      animation: {
        enable: true,
        minimumValue: 0,
        speed: 0.5,
        startValue: 'max',
        destroy: 'min',
      },
    },
    size: {
      value: 5,
    },
    links: {
      enable: false,
    },
    life: {
      duration: {
        sync: true,
        value: 10,
      },
      count: 1,
    },
    move: {
      angle: {
        value: 45,
        offset: 0,
      },
      drift: {
        min: -0,
        max: 0,
      },
      enable: true,
      gravity: {
        enable: true,
        acceleration: 20,
      },
      speed: 90,
      decay: 1 - 0.9,
      direction: -90,
      random: true,
      straight: false,
      outModes: {
        default: 'none',
        bottom: 'destroy',
      },
    },
    rotate: {
      value: {
        min: 0,
        max: 360,
      },
      direction: 'random',
      animation: {
        enable: true,
        speed: 60,
      },
    },
    tilt: {
      direction: 'random',
      enable: true,
      value: {
        min: 0,
        max: 360,
      },
      animation: {
        enable: true,
        speed: 60,
      },
    },
    roll: {
      darken: {
        enable: true,
        value: 25,
      },
      enable: true,
      speed: {
        min: 15,
        max: 25,
      },
    },
    wobble: {
      distance: 20,
      enable: true,
      speed: {
        min: -15,
        max: 15,
      },
    },
  },
};
// Confetti component
// This is using the particles library.
// It would be a good idea to replace it with react-confetti

const Confetti = () => {
  const particlesInit = useCallback(async (engine) => {
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);
  const particlesLoaded = useCallback(async (_container) => {
    console.log(_container);
  }, []);
  console.log('Confetti');
  return (
    <Particles
      id="tsparticles"
      options={CONFETTI_OPTIONS}
      init={particlesInit}
      loaded={particlesLoaded}
    />
  );
};

export default Confetti;

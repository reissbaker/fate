'use strict';

import * as flux from 'zeroflux';
import { Dispatcher } from './slideshow-dispatcher.ts';
import { extend } from 'underscore';

export interface SlideshowState {
  panning: boolean;
  pan: number;
  lastPanTime: number;
  velocity: number;
}

export function build(app: flux.App, dispatcher: Dispatcher) {
  return app.store<SlideshowState>((builder) => {
    builder.reduce(dispatcher.panstart, (state, data) => {
      return extend({}, state, {
        panning: true,
        pan: 0,
        lastPanTime: 0,
        velocity: 0,
      });
    });

    builder.reduce(dispatcher.pan, (state, data) => {
      const { deltaX } = data;
      const distance = deltaX - state.pan;
      const now = window.performance.now();
      const deltaTime = now - state.lastPanTime;

      let velocity: number;

      if(state.lastPanTime === 0) {
        velocity = deltaX / 16;
      } else {
        velocity = distance / deltaTime;
      }

      if(deltaX < 0) velocity = -velocity;

      velocity = velocity * 0.25 + state.velocity * 0.75;

      return extend({}, state, {
        pan: deltaX,
        lastPanTime: now,
        velocity,
      });
    });

    builder.reduce(dispatcher.panend, (state, data) => {
      return extend({}, state, {
        panning: false,
        pan: 0,
        lastPanTime: 0,
      });
    });

    return {
      panning: false,
      pan: 0,
      lastPanTime: 0,
      velocity: 0,
    };
  });
}

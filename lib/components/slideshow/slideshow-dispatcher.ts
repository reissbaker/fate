'use strict';

import * as flux from 'zeroflux';
import { app } from '../../flux-app.ts';

export interface PanStartAction {
}

export interface PanAction {
  deltaX: number;
}

export interface PanEndAction {
}

export interface Dispatcher {
  panstart: flux.ActionDispatcher<PanStartAction>;
  pan: flux.ActionDispatcher<PanAction>;
  panend: flux.ActionDispatcher<PanEndAction>;
}

export function build(app: flux.App) {
  return {
    panstart: app.action<PanStartAction>(),
    pan: app.action<PanAction>(),
    panend: app.action<PanEndAction>(),
  };
}

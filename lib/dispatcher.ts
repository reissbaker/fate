'use strict';

import { app } from './flux-app.ts';

export interface MoveAction {
}

export interface ButtonAction {
}

export interface SwitchScreenAction {
}

export const dispatcher = {
  left: app.action<MoveAction>(),
  right: app.action<MoveAction>(),
  button: app.action<ButtonAction>(),
  reroll: app.action<SwitchScreenAction>(),
};

'use strict';

import * as _ from 'underscore';
import { app } from '../flux-app.ts';
import { dispatcher } from '../dispatcher.ts';
import * as dieType from '../dice/die-type.ts';
import { roll } from '../dice/die.ts';

export interface DiceState {
  die: dieType.DieType;
  rolls: number[];
}

export const diceStore = app.store<DiceState>((builder) => {
  builder.reduce(dispatcher.button, (state) => {
    return _.extend({}, state, {
      rolls: state.rolls.concat([ roll(state.die) ])
    });
  });

  builder.reduce(dispatcher.left, (state) => {
    let index = dieType.allTypes.indexOf(state.die) - 1;
    if(index < 0) index = 0;

    return {
      rolls: [],
      die: dieType.allTypes[index]
    };
  });

  builder.reduce(dispatcher.right, (state) => {
    let index = dieType.allTypes.indexOf(state.die) + 1;
    if(index >= dieType.allTypes.length) index = dieType.allTypes.length - 1;

    return {
      rolls: [],
      die: dieType.allTypes[index]
    };
  });

  builder.reduce(dispatcher.reroll, (state) => {
    return {
      die: state.die,
      rolls: []
    };
  });

  return {
    die: dieType.d20,
    rolls: [],
  };
});

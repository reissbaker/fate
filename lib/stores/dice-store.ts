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

export const diceStore = app.store<DiceState>((getState, setState) => {
  dispatcher.button.bind((data) => {
    const current = getState();

    setState(_.extend({}, current, {
      rolls: current.rolls.concat([ roll(current.die) ])
    }));
  });

  dispatcher.left.bind((data) => {
    let index = dieType.allTypes.indexOf(getState().die) - 1;
    if(index < 0) index = 0;

    setState({
      rolls: [],
      die: dieType.allTypes[index]
    });
  });

  dispatcher.right.bind((data) => {
    let index = dieType.allTypes.indexOf(getState().die) + 1;
    if(index >= dieType.allTypes.length) index = dieType.allTypes.length - 1;

    setState({
      rolls: [],
      die: dieType.allTypes[index]
    });
  });

  dispatcher.reroll.bind((data) => {
    setState({
      die: getState().die,
      rolls: []
    });
  });

  return {
    die: dieType.d20,
    rolls: [],
  };
});

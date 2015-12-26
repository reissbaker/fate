'use strict';

import * as _ from 'underscore';
import * as React from 'react';
import * as gk from 'gamekernel';
import Engine from './engine.ts';
import { SlideshowComponent } from './components/slideshow-component.tsx';
import { ResultComponent } from './components/result-component.tsx';
import * as dieType from './dice/die-type.ts';
import { diceStore } from './stores/dice-store.ts';
import { dispatcher } from './dispatcher.ts';

export enum ScreenState { Rolling, Results };

export interface Props {
  engine: Engine;
}

export interface State {
  screen: ScreenState;
  die: dieType.DieType;
  rolls: number[];
}

const ROLL_DEBOUNCE_MS = 500;

export class Controller extends React.Component<Props, State> {
  private engine: Engine;
  private world: gk.Entity = null;
  private controlEntity: gk.Entity = null;
  private countdown = _.debounce(() => {
    this.setScreen(ScreenState.Results);
  }, ROLL_DEBOUNCE_MS);

  constructor(props: Props) {
    super(props);

    this.engine = props.engine;

    this.state = {
      screen: ScreenState.Rolling,
      die: diceStore.state.die,
      rolls: [],
    };

    diceStore.watch((diceState) => {
      this.setState({
        screen: this.state.screen,
        die: diceState.die,
        rolls: diceState.rolls,
      });

      if(diceState.rolls.length > 0) this.countdown();
    });

    dispatcher.reroll.bind(() => {
      this.setScreen(ScreenState.Rolling);
    });
  }

  componentWillMount() {
    this.world = this.engine.kernel.root().entity();
  }

  componentWillUnmount() {
    this.world.destroy();
  }

  setScreen(screen: ScreenState) {
    this.setState({
      screen,
      die: diceStore.state.die,
      rolls: diceStore.state.rolls,
    });
  }

  render() {
    const currentAppState = diceStore.state;
    const rollValue = currentAppState.die.value(currentAppState.rolls);

    return (
      <div>
        <SlideshowComponent
          dice={ dieType.allTypes }
          die={ this.state.die }
          rolls={ this.state.rolls}
          rollDebounceMs={ ROLL_DEBOUNCE_MS }
          engine={ this.engine }
          parentEntity={ this.world }
          active={ this.state.screen === ScreenState.Rolling }
        />
        <ResultComponent
          result={ rollValue }
          die={ this.state.die }
          rolls={ this.state.rolls }
          engine={ this.engine }
          parentEntity={ this.world }
          active={ this.state.screen === ScreenState.Results }
        />
      </div>
    );
  }
}

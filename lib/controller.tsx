'use strict';

import * as _ from 'underscore';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as gk from 'gamekernel';
import * as Hammer from 'hammerjs';
import Engine from './engine.ts';
import KeyboardBehavior from './controls/keyboard-behavior.ts';
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
    this.switchScreen();
  }, ROLL_DEBOUNCE_MS);

  constructor(props: Props) {
    super(props);

    this.engine = props.engine;

    this.state = {
      screen: ScreenState.Rolling,
      die: diceStore.current.die,
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
  }

  componentDidMount() {
    this.world = this.engine.kernel.root().entity();
    this.engine.behavior.table.attach(this.world, new KeyboardBehavior(this.engine, this));

    const hm = new Hammer.Manager(ReactDOM.findDOMNode(this));
    this.engine.hammer.control.attach(this.world, hm);
    hm.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_HORIZONTAL }));
    hm.add(new Hammer.Tap());
    hm.on("swipeleft", () => {
      this.right();
    });
    hm.on("swiperight", () => {
      this.left();
    });
    hm.on("tap", () => {
      this.action();
    });
  }

  componentWillUnmount() {
    this.world.destroy();
  }

  left() {
    if(this.state.screen === ScreenState.Results) return;
    dispatcher.left.dispatch({});
  }

  right() {
    if(this.state.screen === ScreenState.Results) return;
    dispatcher.right.dispatch({});
  }

  switchScreen() {
    this.setState({
      screen: this.nextScreenState(),
      die: this.state.die,
      rolls: this.state.rolls,
    });
  }

  action() {
    if(this.state.screen === ScreenState.Results) {
      dispatcher.reroll.dispatch({});
      this.switchScreen();
      return;
    }
    dispatcher.button.dispatch({});
  }

  nextScreenState(): ScreenState {
    if(this.state.screen === ScreenState.Results) return ScreenState.Rolling;
    return ScreenState.Results;
  }

  render() {
    const currentAppState = diceStore.current;
    const activeResults = this.state.screen === ScreenState.Results;
    const rollValue = currentAppState.die.value(currentAppState.rolls);

    return (
      <div>
        <SlideshowComponent
          dice={ dieType.allTypes }
          die={ this.state.die }
          rolls={ this.state.rolls}
          rollDebounceMs={ ROLL_DEBOUNCE_MS }
        />
        <ResultComponent
          result={ rollValue }
          active={ activeResults }
          die={ this.state.die }
          rolls={ this.state.rolls }
        />
      </div>
    );
  }
}

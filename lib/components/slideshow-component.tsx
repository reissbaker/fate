'use strict';

import * as gk from 'gamekernel';
import { ActivatableComponent } from './activatable-component.ts';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Hammer from 'hammerjs';
import * as slide from './slide-component.tsx';
import { RollIndicatorComponent } from './roll-indicator-component.tsx';
import { DieType } from '../dice/die-type.ts';
import Engine from '../engine.ts';
import KeyboardBehavior from '../controls/keyboard-behavior.ts';
import { dispatcher } from '../dispatcher.ts';

export interface Props {
  dice: DieType[];
  die: DieType;
  rolls: number[];
  rollDebounceMs: number;
  engine: Engine;
  world: gk.Entity;
  active: boolean;
}

export interface SlideshowState {
  slideIndex: number;
}

export class SlideshowComponent extends ActivatableComponent<Props, SlideshowState> {
  private _entity: gk.Entity;

  activate() {
    const world = this.props.world;
    const engine = this.props.engine;

    this._entity = world.entity();

    // TODO: move control setup into a single function that both this and resultscomponent call
    engine.behavior.table.attach(this._entity, new KeyboardBehavior(engine, this));

    const hm = new Hammer.Manager(ReactDOM.findDOMNode(this));
    engine.hammer.control.attach(this._entity, hm);
    hm.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_HORIZONTAL }));
    engine.hammer.supportTap(hm);
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

  deactivate() {
    this._entity.destroy();
  }

  left() {
    dispatcher.left.dispatch({});
  }

  right() {
    dispatcher.right.dispatch({});
  }

  action() {
    dispatcher.button.dispatch({});
  }

  render() {
    const index = this.props.dice.indexOf(this.props.die);
    const style = {
      transform: 'translateX(' + (-index * 100) + '%)'
    };

    return (
      <div>
        <ul className="slideshow" style={ style }>
          {
            this.props.dice.map((die, i) => {
              return (
                <li key={ die.displayName } className="slide-container">
                  <slide.SlideComponent
                    backgroundColor={ die.backgroundColor }
                    color={ die.color }
                    displayName={ die.displayName }
                    icon={ die.icon }
                    active={ i === index }
                  />
                </li>
              );
            })
          }
        </ul>

        <RollIndicatorComponent rolls={ this.props.rolls } rollDebounceMs={ this.props.rollDebounceMs } />

        <div className="slideshow-dots-container">
          <div className="slideshow-dots">
            {
              this.props.dice.map((die, i) => {
                const activeClass = i === index ? "active" : "";
                return (
                  <div key={ "dot-" + die.displayName } className={ "dot " + activeClass } />
                );
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

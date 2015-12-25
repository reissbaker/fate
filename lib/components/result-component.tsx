'use strict';

import * as gk from 'gamekernel';
import React = require('react');
import * as ReactDOM from 'react-dom';
import * as Hammer from 'hammerjs';
import { ActivatableComponent } from './activatable-component.ts';
import { DieType } from '../dice/die-type.ts';
import Engine from '../engine.ts';
import KeyboardBehavior from '../controls/keyboard-behavior.ts';
import { dispatcher } from '../dispatcher.ts';

const HIDE_CLASS = "hidden";

export interface Props {
  result: number;
  rolls: number[];
  die: DieType;
  engine: Engine;
  world: gk.Entity;
  active: boolean;
}

export class ResultComponent extends ActivatableComponent<Props, {}> {
  private _entity: gk.Entity;

  activate() {
    const world = this.props.world;
    const engine = this.props.engine;

    this._entity = world.entity();
    engine.behavior.table.attach(this._entity, new KeyboardBehavior(engine, this));

    const hm = new Hammer.Manager(ReactDOM.findDOMNode(this));
    engine.hammer.control.attach(this._entity, hm);
    engine.hammer.supportTap(hm);
    hm.on("tap", () => {
      this.action();
    });
  }

  action() {
    dispatcher.reroll.dispatch({});
  }

  deactivate() {
    this._entity.destroy();
  }

  render() {
    const visibilityClass = this.props.active ? "" : HIDE_CLASS;
    const style = {
      color: this.props.die.backgroundColor,
    };

    return (
      <div className={ "full-size result " + visibilityClass } style={ style }>
        <div className="slide-content full-size">
          <div className="center-content">
            <h1>{ this.props.result }</h1>
            <ul className={ "results-list " + (this.props.rolls.length === 1 ? "hidden" : "") }>
              {
                this.props.rolls.map((roll, index) => {
                  return (
                    <li key={ 'roll-' + index }>
                      { roll }
                      { index === this.props.rolls.length - 1 ? "" : " + " }
                    </li>
                  );
                })
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

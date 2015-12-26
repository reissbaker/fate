'use strict';

import * as gk from 'gamekernel';
import React = require('react');
import { GkReactComponent, GkProps } from './gk-react-component.ts';
import { DieType } from '../dice/die-type.ts';
import Engine from '../engine.ts';
import { dispatcher } from '../dispatcher.ts';
import { bindControls } from '../controls/bind-controls.ts';

const HIDE_CLASS = "hidden";

export interface Props extends GkProps {
  result: number;
  rolls: number[];
  die: DieType;
  engine: Engine;
}

export class ResultComponent extends GkReactComponent<Props, {}> {
  entityCreated(entity: gk.Entity) {
    bindControls(entity, this.props.engine, this, {
      action() { dispatcher.reroll.dispatch({}); },
    });
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

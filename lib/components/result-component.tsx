'use strict';

import React = require('react');
import { DieType } from '../dice/die-type.ts';

const HIDE_CLASS = "hidden";

export interface Props {
  active: boolean;
  result: number;
  rolls: number[];
  die: DieType;
}

export class ResultComponent extends React.Component<Props, {}> {
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

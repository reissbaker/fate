'use strict';

import * as React from 'react';

const DEFAULT_COLOR = 0xFFFFFF;
const HIGHLIGHT_COLOR = 0xFFFF00;

export interface Props {
  rolls: number[];
  rollDebounceMs: number;
}

export interface State {
  numRolls: number;
  color: number;
  targetColor: number;
}

export class RollIndicatorComponent extends React.Component<Props, State> {
  constructor() {
    super();

    this.state = {
      color: HIGHLIGHT_COLOR,
      targetColor: HIGHLIGHT_COLOR,
      numRolls: 0,
    };
  }

  componentWillReceiveProps(props: Props) {
    const prevRolls = this.state.numRolls;
    const currRolls = props.rolls.length;
    const noRolls = currRolls === 0;

    this.setState({
      numRolls: currRolls,
      color: noRolls || currRolls !== prevRolls ? HIGHLIGHT_COLOR : this.state.color,
      targetColor: noRolls ? HIGHLIGHT_COLOR : DEFAULT_COLOR,
    });
  }

  render() {
    const rollIndicatorStyle = {
      //transition: 'background-color ' + (this.props.rollDebounceMs / 1000) + 's'
    };
    return (
      <div className="rolls-container">
        {
          this.props.rolls.map((roll, i) => {
            return (
              <div
                className="roll"
                key={ "roll-" + i }
                style={ rollIndicatorStyle }
              />
            );
          })
        }
      </div>
    );
  }
}

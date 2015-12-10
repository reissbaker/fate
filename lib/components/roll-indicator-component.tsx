'use strict';

import * as React from 'react';

export interface Props {
  rolls: number[];
  rollDebounceMs: number;
}

export interface State {
  numRolls: number;
  opacity: number;
  targetOpacity: number;
}

export class RollIndicatorComponent extends React.Component<Props, State> {
  constructor() {
    super();

    this.state = {
      opacity: 1,
      targetOpacity: 1,
      numRolls: 0,
    };
  }

  componentWillReceiveProps(props: Props) {
    const prevRolls = this.state.numRolls;
    const currRolls = props.rolls.length;
    const noRolls = currRolls === 0;

    this.setState({
      numRolls: currRolls,
      opacity: noRolls || currRolls !== prevRolls ? 1 : this.state.opacity,
      targetOpacity: noRolls ? 1 : 0,
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

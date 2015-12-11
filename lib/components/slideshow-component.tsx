'use strict';

import * as React from 'react';
import * as slide from './slide-component.tsx';
import { RollIndicatorComponent } from './roll-indicator-component.tsx';
import { DieType } from '../dice/die-type.ts';

export interface Props {
  dice: DieType[];
  die: DieType;
  rolls: number[];
  rollDebounceMs: number;
}

export interface SlideshowState {
  slideIndex: number;
}

export class SlideshowComponent extends React.Component<Props, SlideshowState> {
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

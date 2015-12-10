'use strict';

import * as React from 'react';
import * as slide from './slide-component.tsx';
import { DieType } from '../dice/die-type.ts';

export interface Props {
  dice: slide.Die[];
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

    const rollIndicatorStyle = {
      //transition: 'background-color ' + (this.props.rollDebounceMs / 1000) + 's'
    };

    return (
      <div>
        <ul className="slideshow" style={ style }>
          {
            this.props.dice.map((die) => {
              return (
                <li key={ die.displayName } className="slide-container">
                  <slide.SlideComponent { ...die }/>
                </li>
              );
            })
          }
        </ul>
        <div className="rolls-container">
          {
            [ 0, 1, 2, 3, 4, 5 ].map((i) => {
              const activeClass = i < this.props.rolls.length ? "active" : "";
              return (
                <div
                  className={ "roll " + activeClass }
                  key={ "roll-" + i }
                  style={ rollIndicatorStyle }
                />
              );
            })
          }
        </div>
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

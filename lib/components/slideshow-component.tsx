'use strict';

import * as gk from 'gamekernel';
import { GkReactComponent, GkProps } from './gk-react-component.ts';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as slide from './slide-component.tsx';
import { RollIndicatorComponent } from './roll-indicator-component.tsx';
import { DieType } from '../dice/die-type.ts';
import Engine from '../engine.ts';
import { dispatcher } from '../dispatcher.ts';
import { bindControls } from '../controls/bind-controls.ts';

export interface Props extends GkProps {
  dice: DieType[];
  die: DieType;
  rolls: number[];
  rollDebounceMs: number;
  engine: Engine;
}

export interface State {
  panning: boolean;
  pan: number;
  lastPanTime: number;
  enroute: boolean;
  enrouteFrom: number;
  velocity: number;
}

export class SlideshowComponent extends GkReactComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      panning: false,
      pan: 0,
      lastPanTime: 0,
      enroute: false,
      enrouteFrom: 0,
      velocity: 0,
    };
  }

  entityCreated(entity: gk.Entity) {
    bindControls(entity, this.props.engine, this, {
      left() { dispatcher.left.dispatch({}); },
      right() { dispatcher.right.dispatch({}); },
      action() { dispatcher.button.dispatch({}); },
      panstart: () => {
        this.setState({
          panning: true,
          pan: 0,
          lastPanTime: 0,
          enroute: this.state.enroute,
          enrouteFrom: this.state.enrouteFrom,
          velocity: 0,
        });
      },
      pan: (deltaX: number) => {
        const distance = deltaX - this.state.pan;
        const now = window.performance.now();
        const deltaTime = now - this.state.lastPanTime;
        let velocity: number;

        if(this.state.lastPanTime === 0) {
          velocity = deltaX / 16;
        } else {
          velocity = distance / deltaTime;
        }

        if(deltaX < 0) velocity = -velocity;

        velocity = velocity * 0.5 + this.state.velocity * 0.5;

        this.setState({
          panning: this.state.panning,
          pan: deltaX,
          lastPanTime: now,
          enroute: this.state.enroute,
          enrouteFrom: this.state.enrouteFrom,
          velocity,
        });
      },
      panend: () => {
        let enroute = false;
        let dispatch = () => {};
        const enrouteFrom = this.xTranslation();

        if(this.percentPan() >= 40) {
          dispatch = () => { dispatcher.left.dispatch({}); };
          enroute = true;
        }
        else if(this.percentPan() <= -40) {
          dispatch = () => { dispatcher.right.dispatch({}); };
          enroute = true;
        }

        this.setState({
          panning: false,
          pan: 0,
          lastPanTime: 0,
          velocity: this.state.velocity,
          enroute,
          enrouteFrom,
        });

        dispatch();
      },
    });
  }

  componentDidMount() {
    super.componentDidMount();

    const el = ReactDOM.findDOMNode(this);
    el.addEventListener('transitionend', () => {
      if(this.state.enroute) {
        this.setState({
          panning: this.state.panning,
          pan: this.state.pan,
          lastPanTime: this.state.lastPanTime,
          enroute: false,
          enrouteFrom: 0,
          velocity: 0,
        });
      }
    });
  }

  percentPan() {
    return (this.state.pan / document.body.clientWidth) * 100;
  }

  xTranslation() {
    const index = this.props.dice.indexOf(this.props.die);
    const target = -index * 100;
    const offset = this.percentPan();
    const translation = target + offset;
    const min = -(this.props.dice.length - 1) * 100;
    const max = 0;
    if(translation < min) return min;
    if(translation > max) return max;
    return translation;
  }

  transitionTime() {
    if(this.state.panning) return 0.05;

    if(this.state.enroute) {
      const percentDistance = Math.abs(this.xTranslation() - this.state.enrouteFrom) / 100;
      const distance = percentDistance * document.body.clientWidth;
      const velocity = Math.abs(this.state.velocity * 1000);
      const time = distance / velocity;
      if(time > 0.7) return 0.7;
      return time;
    }

    return 0.7;
  }

  transitionEasing() {
    if(this.state.enroute || this.state.panning) return 'linear';
    return 'ease';
  }

  render() {
    const index = this.props.dice.indexOf(this.props.die);
    const style = {
      transition: `transform ${this.transitionTime()}s`,
      transitionTimingFunction: this.transitionEasing(),
      transform: `translateX(${this.xTranslation()}%)`,
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

        <RollIndicatorComponent
          rolls={ this.props.rolls }
          rollDebounceMs={ this.props.rollDebounceMs }
        />

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

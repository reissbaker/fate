'use strict';

import * as gk from 'gamekernel';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { extend } from 'underscore';
import { GkReactComponent, GkProps } from '../gk-react-component.ts';
import { app } from '../../flux-app.ts';
import * as slide from './slide-component.tsx';
import { RollIndicatorComponent } from '../roll-indicator-component.tsx';
import { DieType } from '../../dice/die-type.ts';
import Engine from '../../engine.ts';
import { dispatcher } from '../../dispatcher.ts';
import { bindControls } from '../../controls/bind-controls.ts';
import * as BezierEasing from 'bezier-easing';
import * as slideDispatcher from './slideshow-dispatcher.ts';
import * as panstate from './pan-state.ts';

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
  velocity: number;
  enroute: boolean;
  enrouteFrom: number;
}

const ease = BezierEasing.css["ease-out"];
const y0 = ease.get(0);
const y1 = ease.get(0.05);
const EASE_OUT_SLOPE = (y1 - y0) / 0.05;

const LEFT_DISPATCH = () => { dispatcher.left.dispatch({}); };
const RIGHT_DISPATCH = () => { dispatcher.right.dispatch({}); };

const SWIPE_VELOCITY = 0.2;
const MAX_SLOW_PAN = 40;

export class SlideshowComponent extends GkReactComponent<Props, State> {
  // Note that this is only safe because we never actually destroy the slideshow component. If we
  // did, we'd have to get the dispatcher and store from some singleton so that this wasn't getting
  // constantly initialized and so that history rewinding would result in this picking up the
  // correct previous histories.
  //
  // TODO: fix this in zeroflux? app.dispatcher and app.store could take IDs, and would init if the
  // id doesn't exist and would return old objects if it does.
  private _slideDispatcher = slideDispatcher.build(app);
  private _panStore = panstate.build(app, this._slideDispatcher);

  constructor(props: Props) {
    super(props);

    this.state = {
      panning: false,
      pan: 0,
      velocity: 0,
      enroute: false,
      enrouteFrom: 0,
    };

    this._panStore.watch((state, prevState) => {
      let dispatch = () => {};
      let enroute = false;
      const enrouteFrom = this.xTranslation();

      if(prevState.panning && !state.panning) {
        const percentPan = this.percentPan(prevState.pan);

        if(Math.abs(percentPan) >= MAX_SLOW_PAN || prevState.velocity > SWIPE_VELOCITY) {
          dispatch = percentPan > 0 ? LEFT_DISPATCH : RIGHT_DISPATCH;
          enroute = true;
        }
      }

      this.setState(extend({}, this.state, {
        panning: state.panning,
        pan: state.pan,
        enroute,
        enrouteFrom,
      }));

      dispatch();
    });
  }

  entityCreated(entity: gk.Entity) {
    bindControls(entity, this.props.engine, this, {
      left() { dispatcher.left.dispatch({}); },
      right() { dispatcher.right.dispatch({}); },
      action() { dispatcher.button.dispatch({}); },

      panstart: () => { this._slideDispatcher.panstart.dispatch({}); },
      pan: (deltaX: number) => { this._slideDispatcher.pan.dispatch({ deltaX }); },
      panend: () => { this._slideDispatcher.panend.dispatch({}); },
    });
  }

  componentDidMount() {
    super.componentDidMount();

    const el = ReactDOM.findDOMNode(this);
    el.addEventListener('transitionend', () => {
      if(this.state.enroute) {
        this.setState(extend({}, this.state, {
          enroute: false,
          enrouteFrom: 0,
        }));
      }
    });
  }

  percentPan(pan: number) {
    return (pan / document.body.clientWidth) * 100;
  }

  xTranslation() {
    const index = this.props.dice.indexOf(this.props.die);
    const target = -index * 100;
    const offset = this.percentPan(this.state.pan);
    const translation = target + offset;
    const min = -(this.props.dice.length - 1) * 100;
    const max = 0;
    if(translation < min) return min;
    if(translation > max) return max;
    return translation;
  }

  maxTime() {
    const width = document.body.clientWidth;
    if(width > 1000) return 0.5;
    return 0.28;
  }

  transitionTime() {
    if(this.state.panning) return 0.05;

    const maxTime = this.maxTime();
    if(this.state.enroute) {
      const percentDistance = Math.abs(this.xTranslation() - this.state.enrouteFrom) / 100;
      const distance = percentDistance * document.body.clientWidth;
      const velocity = Math.abs(this.state.velocity * 1000);
      let time = distance / velocity * EASE_OUT_SLOPE;

      if(time > maxTime) return maxTime;
      return time;
    }

    return maxTime + 0.1;
  }

  transitionEasing() {
    if(this.state.panning) return 'linear';
    if(this.state.enroute) return 'ease-out';
    return 'ease';
  }

  render() {
    let index = this.props.dice.indexOf(this.props.die);
    if(this.state.panning) {
      const pan = this.percentPan(this.state.pan);

      if(pan >= 40) {
        index = index - 1;
        if(index < 0) index = 0;
      }
      else if(pan <= -40) {
        index = index + 1;
        if(index >= this.props.dice.length) index = this.props.dice.length - 1;
      }
    }

    const style = {
      transition: `transform ${this.transitionTime()}s ${this.transitionEasing()}`,
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

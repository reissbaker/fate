'use strict';

import * as gk from 'gamekernel';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { extend, isEqual } from 'underscore';
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

const NO_DISPATCH = () => {};
const LEFT_DISPATCH = () => { dispatcher.left.dispatch({}); };
const RIGHT_DISPATCH = () => { dispatcher.right.dispatch({}); };

const SWIPE_VELOCITY = 0.2;
const MAX_SLOW_PAN = 40;

const DEFAULT_TRANSITION = 'ease';
const PAN_TRANSITION = 'linear';
const ENROUTE_TRANSITION = 'ease-out';

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

    const initialPanState = this._panStore.state;

    this.state = {
      panning: initialPanState.panning,
      pan: initialPanState.pan,
      velocity: initialPanState.velocity,
      enroute: false,
      enrouteFrom: 0,
    };

    this._panStore.watch((state) => {
      let dispatch = NO_DISPATCH;
      let enroute = false;
      let enrouteFrom = 0;

      // If we're done panning, we may need to consider this a swipe and move to next screen
      if(this.state.panning && !state.panning) {
        const percentPan = this.percentPan(this.state.pan);
        if(Math.abs(percentPan) >= MAX_SLOW_PAN || this.state.velocity > SWIPE_VELOCITY) {
          dispatch = percentPan > 0 ? LEFT_DISPATCH : RIGHT_DISPATCH;
          enroute = true;
          enrouteFrom = this.xTranslation(this.state.pan);
        }
      }

      this.setState({
        panning: state.panning,
        pan: state.pan,
        velocity: state.velocity,
        enroute,
        enrouteFrom,
      });

      dispatch();
    });
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if(isEqual(this.props, nextProps)) {
      if(this.state.panning && nextState.panning) {
        this.fastPan(nextState.pan);
        return false;
      }
      else if(this.state.panning && !nextState.panning) {
        // Need to reset the pan and transition, since React hasn't been keeping track of it
        // (we've been skipping it and setting the pan directly in the above block).
        this.resetDefaultTransition();
        this.fastPan(nextState.pan);
        return true;
      }
    }

    return true;
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

  xTranslation(pan: number) {
    const index = this.props.dice.indexOf(this.props.die);
    const target = -index * 100;
    const offset = this.percentPan(pan);
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
      const translation = this.xTranslation(this.state.pan);
      const percentDistance = Math.abs(translation - this.state.enrouteFrom) / 100;
      const distance = percentDistance * document.body.clientWidth;
      const velocity = Math.abs(this.state.velocity * 1000);
      let time = distance / velocity * EASE_OUT_SLOPE;

      if(time > maxTime) return maxTime;
      return time;
    }

    return maxTime + 0.1;
  }

  transitionEasing() {
    if(this.state.panning) return PAN_TRANSITION;
    if(this.state.enroute) return ENROUTE_TRANSITION;
    return DEFAULT_TRANSITION;
  }

  slideshowEl() {
    const node = ReactDOM.findDOMNode(this);
    return node.querySelector('.slideshow') as HTMLElement;
  }

  resetDefaultTransition() {
    this.slideshowEl().style.transition = `transform ${this.maxTime()}s ${DEFAULT_TRANSITION}`;
  }

  fastPan(pan: number) {
    this.slideshowEl().style.transform = `translateX(${this.xTranslation(pan)}%)`;
  }

  render() {
    const index = this.props.dice.indexOf(this.props.die);
    const style = {
      transition: '',
      transform: `translateX(${this.xTranslation(this.state.pan)}%)`,
    };

    if(!this.state.panning) {
      style.transition = `transform ${this.transitionTime()}s ${this.transitionEasing()}`;
    }

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

'use strict';

import * as gk from 'gamekernel';
import * as Hammer from 'hammerjs';
import Engine from '../engine.ts';

export default class PanBehavior extends gk.Behavior {
  private _callbacks: Args;
  private _deltaX = 0;
  private _velocityX = 0;
  private _started = false;
  private _ended = false;

  constructor(hm: Hammer.Manager, args: Args) {
    super();
    this._callbacks = args;

    hm.on("panleft", (e) => {
      this._deltaX = e.deltaX;
      this._velocityX = e.velocityX;
    });
    hm.on("panright", (e) => {
      this._deltaX = e.deltaX;
      this._velocityX = e.velocityX;
    });
    hm.on("panstart", () => {
      this._started = true;
      if(this._ended) this._ended = false;
    });
    hm.on("panend", () => {
      this._ended = true;
    });
  }

  update(delta: number): void {
    if(this._started && this._callbacks.panstart) this._callbacks.panstart();
    if(this._deltaX !== 0 && this._callbacks.pan) this._callbacks.pan(this._deltaX, this._velocityX);
    if(this._ended && this._callbacks.panend) this._callbacks.panend();

    this._started = false;
    this._deltaX = 0;
    this._velocityX = 0;
    this._ended = false;
  }
}

export interface Args {
  panstart?: () => any;
  panend?: () => any;
  pan?: (deltaX?: number, velocityX?: number) => any;
}

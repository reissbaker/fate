'use strict';

import * as gk from 'gamekernel';
import * as key from 'gk-keyboard';
import Engine from '../engine.ts';

export default class KeyboardBehavior extends gk.Behavior {
  private _keyboard: key.KeyboardSystem;
  private _callbacks: Args;

  constructor(engine: Engine, args: Args) {
    super();
    this._keyboard = engine.keyboard;
    this._callbacks = args;
  }

  update(delta: number): void {
    if(this._keyboard.pressed(this._keyboard.key.SPACE)) this._callbacks.action();
    if(this._keyboard.pressed(this._keyboard.key.LEFT)) {
      if(this._callbacks.left) this._callbacks.left();
    }
    if(this._keyboard.pressed(this._keyboard.key.RIGHT)) {
      if(this._callbacks.right) this._callbacks.right();
    }
  }
}

export interface Args {
  action: () => any;
  left?: () => any;
  right?: () => any;
}

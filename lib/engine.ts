'use strict';

import * as gk from 'gamekernel';
import * as keyboard from 'gk-keyboard';
import * as hammer from './controls/hammer-system.ts';

export default class Engine extends gk.Engine {
  keyboard = new keyboard.KeyboardSystem();
  behavior = new gk.BehaviorSystem();
  hammer = new hammer.HammerSystem;

  private _runner: gk.Runner;

  constructor(kernel: gk.Kernel, runner: gk.Runner) {
    super(kernel);

    this._runner = runner;

    kernel.attach(this.keyboard);
    kernel.attach(this.behavior);
    kernel.attach(this.hammer);
  }

  start() {
    this._runner.start();
  }

  stop() {
    this.kernel.nextTick(() => {
      this.kernel.reset();
      this._runner.stop();
    });
  }
}

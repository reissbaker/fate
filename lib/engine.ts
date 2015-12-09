'use strict';

import * as gk from 'gamekernel';
import * as keyboard from 'gk-keyboard';

export default class Engine extends gk.Engine {
  keyboard = new keyboard.KeyboardSystem();
  behavior = new gk.BehaviorSystem();

  private _runner: gk.Runner;

  constructor(kernel: gk.Kernel, runner: gk.Runner) {
    super(kernel);

    this._runner = runner;

    kernel.attach(this.keyboard);
    kernel.attach(this.behavior);
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

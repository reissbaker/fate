'use strict';

import * as gk from 'gamekernel';
import * as Hammer from 'hammerjs';

export default class HammerLifetimeManager extends gk.Component {
  private _hammer: Hammer.Manager;

  constructor(hammer: Hammer.Manager) {
    super();
    this._hammer = hammer;
  }

  destroy() {
    this._hammer.destroy();
  }
}

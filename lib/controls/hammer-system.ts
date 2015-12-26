'use strict';

import * as gk from 'gamekernel';
import * as Hammer from 'hammerjs';
import HammerLifetimeManager from './hammer-lifetime-manager.ts';

export class HammerSystem extends gk.System {
  private _table: gk.Table<HammerLifetimeManager>;
  control: gk.welder.StandardWelder<HammerLifetimeManager, Hammer.Manager>;

  onAttach(db: gk.Database) {
    this._table = db.table<HammerLifetimeManager>();
    this.control = new gk.welder.StandardWelder<HammerLifetimeManager, Hammer.Manager>(
      this._table,
      (manager) => { return new HammerLifetimeManager(manager); }
    );

    this._table.on("detach", (control) => {
      control.destroy();
    });
  }

  onDetach(db: gk.Database) {
    db.drop(this._table);
    this._table = null;
    this.control = null;
  }

  // TODO: move this into bindControls
  supportTap(hm: Hammer.Manager) {
    hm.add(new Hammer.Tap({ interval: 100, time: 300, threshold: 10 }));
  }
}

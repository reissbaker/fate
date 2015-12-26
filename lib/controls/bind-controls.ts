'use strict';

import * as gk from 'gamekernel';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Hammer from 'hammerjs';
import Engine from '../engine.ts';
import KeyboardBehavior from './keyboard-behavior.ts';
import PanBehavior from './pan-behavior.ts';

export function bindControls<P, S>(
  entity: gk.Entity,
  engine: Engine,
  r: React.Component<P, S>,
  args: Args
) {
  engine.behavior.table.attach(entity, new KeyboardBehavior(engine, args));

  const hm = new Hammer.Manager(ReactDOM.findDOMNode(r));
  engine.hammer.control.attach(entity, hm);
  setupTap(engine, hm, args);
  setupPan(entity, engine, hm, args);
}

function setupTap(engine: Engine, hm: Hammer.Manager, args: Args) {
  if(args.action) {
    engine.hammer.supportTap(hm);
    hm.on("tap", () => {
      args.action();
    });
  }
}

function setupPan(entity: gk.Entity, engine: Engine, hm: Hammer.Manager, args: Args) {
  if(args.pan) {
    hm.add(new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL }));
    engine.behavior.table.attach(entity, new PanBehavior(hm, args));
  }
}

export interface Args {
  left?: () => void;
  right?: () => void;
  action?: () => void;
  pan?: (deltaX: number) => void;
  panstart?: () => void;
  panend?: () => void;
}

'use strict';
import * as gk from 'gamekernel';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Hammer from 'hammerjs';
import Engine from '../engine.ts';
import KeyboardBehavior from '../controls/keyboard-behavior.ts';

export function bindControls<P, S>(
  entity: gk.Entity,
  engine: Engine,
  r: React.Component<P, S>,
  args: Args
) {
  engine.behavior.table.attach(entity, new KeyboardBehavior(engine, args));

  const hm = new Hammer.Manager(ReactDOM.findDOMNode(r));
  engine.hammer.control.attach(entity, hm);

  if(args.left || args.right) {
    hm.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_HORIZONTAL }));
    if(args.right) {
      hm.on("swipeleft", () => {
        args.right();
      });
    }
    if(args.left) {
      hm.on("swiperight", () => {
        args.left();
      });
    }
  }

  if(args.action) {
    engine.hammer.supportTap(hm);
    hm.on("tap", () => {
      args.action();
    });
  }
}

export interface Args {
  left?: () => void;
  right?: () => void;
  action?: () => void;
}

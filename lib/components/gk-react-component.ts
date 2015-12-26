'use strict';

import * as gk from 'gamekernel';
import { ActivatableComponent, ActiveProp } from './activatable-component.ts';

export interface GkProps extends ActiveProp {
  parentEntity: gk.Entity;
}

export abstract class GkReactComponent<P extends GkProps, S> extends ActivatableComponent<P, S> {
  protected entity: gk.Entity;

  activate() {
    this.entity = this.props.parentEntity.entity();
    this.entityCreated(this.entity);
  }

  deactivate() {
    this.entity.destroy();
  }

  abstract entityCreated(entity: gk.Entity): void;
}

'use strict';

import * as React from 'react';

export interface ActiveProp {
  active: boolean;
}

export abstract class ActivatableComponent<P extends ActiveProp, S> extends React.Component<P, S> {
  private _everActivated = false;

  componentWillReceiveProps(props: ActiveProp) {
    if(props.active !== this.props.active) {
      if(props.active) {
        this._everActivated = true;
        this.activate();
      }
      else this.deactivate();
    }
  }

  componentDidMount() {
    this._everActivated = true;
    if(this.props.active) this.activate();
  }

  componentWillUnmount() {
    if(this._everActivated) this.deactivate();
  }

  abstract activate(): void;
  abstract deactivate(): void;
}

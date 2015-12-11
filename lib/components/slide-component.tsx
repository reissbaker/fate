'use strict';

import * as React from 'react';

export interface Die {
  backgroundColor: string;
  color: string;
  displayName: string;
  icon: string;
  active: boolean;
}

export class SlideComponent extends React.Component<Die, {}> {
  render() {
    const style = {
      backgroundColor: this.props.backgroundColor,
      color: this.props.color,
    };

    return (
      <div className="slide full-size" style={ style }>
        <div className="slide-content full-size">
          <h1 className="center-content">{ this.props.displayName }</h1>
        </div>
      </div>
    );
  }
}

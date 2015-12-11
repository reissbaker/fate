///<reference path="./typings/tsd.d.ts"/>
///<reference path="./custom-typings/hammerjs.d.ts"/>
'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Controller } from './lib/controller.tsx';
import * as gk from 'gamekernel';
import Engine from './lib/engine';

const kernel = new gk.Kernel();
const runner = new gk.Runner(kernel, 30);
const engine = new Engine(kernel, runner);
engine.start();

ReactDOM.render(
  <Controller engine={ engine } />,
  document.querySelector('#app-container-js')
);


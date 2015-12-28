// Type definitions for bezier-easing
// Project: https://github.com/gre/bezier-easing
// Definitions by: brian ridley <https://github.com/ptlis/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare interface BezierEasing {
  css: BezierEasingCss;
  get(ratio: number): number;
  getPoints(): Array<number>;
  toString(): string;
  toCSS(): string;
}

declare interface BezierEasingCss {
  'ease': BezierEasing;
  'linear': BezierEasing;
  'ease-in': BezierEasing;
  'ease-out': BezierEasing;
  'ease-in-out': BezierEasing;
  easeOut: BezierEasing;
}


declare module "bezier-easing" {
  const ease: BezierEasing;
  export = ease;
}

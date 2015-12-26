declare module "hammerjs" {
  export class Manager {
    constructor(el: Element, opts?: {});
    add(r: Recognizer): void;
    on(ev: string, cb: (ev?: Event) => any): void;
    destroy(): void;
  }

  export class Recognizer {
  }

  export class Swipe extends Recognizer {
    constructor(opts: { direction: string });
  }

  export class Pan extends Recognizer {
    constructor(opts: { direction: string });
  }

  export class Tap extends Recognizer {
    constructor(opts: { interval?: number, threshold?: number, time?: number });
  }

  export const DIRECTION_HORIZONTAL: string;

  export class Event {
    deltaX: number;
  }

}

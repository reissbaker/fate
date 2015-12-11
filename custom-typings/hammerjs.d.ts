declare module "hammerjs" {
  export class Manager {
    constructor(el: Element, opts?: {});
    add(r: Recognizer): void;
    on(ev: string, cb: (...args: any[]) => any): void;
    destroy(): void;
  }

  export class Recognizer {
  }

  export class Swipe extends Recognizer {
    constructor(opts: { direction: string });
  }

  export class Pan extends Recognizer {
  }

  export class Tap extends Recognizer {
  }

  export const DIRECTION_HORIZONTAL: string;

}

'use strict';

import { DieType } from './die-type.ts';

interface Crypto {
  getRandomValues(arr: Uint16Array): void;
}

declare const crypto: Crypto;

const MAX_16_BIT_INT = Math.pow(2, 16) - 1;

export function roll(dieType: DieType): number {
  if(usesCrypto()) return secureDie(dieType.max);
  return insecureDie(dieType.max);
}

export function usesCrypto(): boolean {
  return !!crypto;
}

function secureDie(max: number): number {
  const arr = new Uint16Array(1);
  crypto.getRandomValues(arr);

  if(arr[0] === MAX_16_BIT_INT) return max;

  const size = MAX_16_BIT_INT / max;
  return Math.floor(arr[0] / size) + 1;
}

function insecureDie(max: number): number {
  return Math.floor(Math.random() * max) + 1;
}

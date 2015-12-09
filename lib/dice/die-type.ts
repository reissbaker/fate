'use strict';

export interface DieInterface {}

interface BaseDie {
  max: number;
  color: string;
  backgroundColor: string;
  icon: string;
}

interface DieCalculatable {
  displayName: string;
  value: (rolls: number[]) => number;
}

export type DieType = BaseDie & DieCalculatable;

export const allTypes: DieType[] = [];

function defineType(t: DieType): DieType {
  allTypes.push(t);
  return t;
}

function defineSumType(t: BaseDie): DieType {
  return defineType({
    max: t.max,
    backgroundColor: t.backgroundColor,
    color: t.color,
    icon: t.icon,
    displayName: 'D' + t.max,
    value: sum,
  });
}

function sum(rolls: number[]): number {
  return rolls.reduce((sum, roll) => { return sum + roll; }, 0);
}

export const d2 = defineSumType({
  max: 2,
  backgroundColor: '#EF866E',
  color: '#FFF',
  icon: 'test',
});

export const d4 = defineSumType({
  max: 4,
  backgroundColor: '#D6527D',
  color: '#FFF',
  icon: 'test',
});

export const d6 = defineSumType({
  max: 6,
  backgroundColor: '#E276DA',
  color: '#FFF',
  icon: 'test',
});

export const d8 = defineSumType({
  max: 8,
  backgroundColor: '#912CD0',
  color: '#FFF',
  icon: 'test',
});

export const d10 = defineSumType({
  max: 10,
  backgroundColor: '#3F72E4',
  color: '#FFF',
  icon: 'test',
});

export const d12 = defineSumType({
  max: 12,
  backgroundColor: '#52B7FF',
  color: '#FFF',
  icon: 'test',
});

export const d20 = defineSumType({
  max: 20,
  backgroundColor: '#3DB36C',
  color: '#FFF',
  icon: 'test',
});

export const percentile = defineType({
  displayName: 'Percentile',
  max: 10,
  backgroundColor: '#47465D',
  color: '#FFF',
  icon: 'test',

  value(rolls: number[]): number {
    if(rolls.length === 0) return 0;

    let sum = 0;

    for(let i = 0; i < rolls.length - 1; i++) {
      sum += (rolls[i] - 1) * Math.pow(10, rolls.length - i - 1);
    }

    sum += rolls[rolls.length - 1];

    return sum;
  }
});

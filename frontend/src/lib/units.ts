// Heights and weights are stored as metric (cm, kg) and displayed as imperial
// (ft/in, st/lb). The user types imperial in the UI; conversion to metric
// happens in the form widget before submission.

const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const KG_PER_POUND = 0.45359237;
const POUNDS_PER_STONE = 14;

export interface FeetInches {
  feet: number;
  inches: number;
}

export interface StonePounds {
  stone: number;
  pounds: number;
}

export function cmToFeetInches(cm: number): FeetInches {
  const totalInches = cm / CM_PER_INCH;
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  const inches = Math.round(totalInches - feet * INCHES_PER_FOOT);
  if (inches === INCHES_PER_FOOT) {
    return { feet: feet + 1, inches: 0 };
  }
  return { feet, inches };
}

export function feetInchesToCm({ feet, inches }: FeetInches): number {
  const totalInches = feet * INCHES_PER_FOOT + inches;
  return Math.round(totalInches * CM_PER_INCH * 10) / 10;
}

export function kgToStonePounds(kg: number): StonePounds {
  const totalPounds = kg / KG_PER_POUND;
  const stone = Math.floor(totalPounds / POUNDS_PER_STONE);
  const pounds = Math.round(totalPounds - stone * POUNDS_PER_STONE);
  if (pounds === POUNDS_PER_STONE) {
    return { stone: stone + 1, pounds: 0 };
  }
  return { stone, pounds };
}

export function stonePoundsToKg({ stone, pounds }: StonePounds): number {
  const totalPounds = stone * POUNDS_PER_STONE + pounds;
  return Math.round(totalPounds * KG_PER_POUND * 10) / 10;
}

export function formatHeight(cm: number): string {
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
}

export function formatWeight(kg: number): string {
  const { stone, pounds } = kgToStonePounds(kg);
  return `${stone}st ${pounds}lb`;
}

import { describe, it, expect } from 'vitest';
import {
  cmToFeetInches,
  feetInchesToCm,
  formatHeight,
  formatWeight,
  kgToStonePounds,
  stonePoundsToKg,
} from './units';

describe('height conversions', () => {
  it('cmToFeetInches handles common heights', () => {
    expect(cmToFeetInches(180)).toEqual({ feet: 5, inches: 11 });
    expect(cmToFeetInches(188)).toEqual({ feet: 6, inches: 2 });
    expect(cmToFeetInches(152.4)).toEqual({ feet: 5, inches: 0 });
  });

  it('rounds inches up to a foot when needed', () => {
    expect(cmToFeetInches(182.8)).toEqual({ feet: 6, inches: 0 });
  });

  it('feetInchesToCm rounds to one decimal', () => {
    expect(feetInchesToCm({ feet: 6, inches: 0 })).toBe(182.9);
    expect(feetInchesToCm({ feet: 5, inches: 11 })).toBe(180.3);
  });

  it('round-trips within ~1cm tolerance', () => {
    for (const cm of [150, 165.5, 175, 188, 200]) {
      const fi = cmToFeetInches(cm);
      const back = feetInchesToCm(fi);
      expect(Math.abs(back - cm)).toBeLessThanOrEqual(1.5);
    }
  });

  it('formatHeight outputs feet/inches notation', () => {
    expect(formatHeight(188)).toBe(`6'2"`);
  });
});

describe('weight conversions', () => {
  it('kgToStonePounds handles common weights', () => {
    expect(kgToStonePounds(76.2)).toEqual({ stone: 12, pounds: 0 });
    expect(kgToStonePounds(95)).toEqual({ stone: 14, pounds: 13 });
  });

  it('rounds pounds up to a stone when needed', () => {
    expect(kgToStonePounds(95.25)).toEqual({ stone: 15, pounds: 0 });
  });

  it('stonePoundsToKg rounds to one decimal', () => {
    expect(stonePoundsToKg({ stone: 12, pounds: 0 })).toBe(76.2);
  });

  it('formatWeight outputs stone/pound notation', () => {
    expect(formatWeight(76.2)).toBe('12st 0lb');
  });
});

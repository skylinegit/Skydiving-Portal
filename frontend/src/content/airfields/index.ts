import type { AirfieldContent } from '@/types';
import { headcorn } from './headcorn';
import { oldSarum } from './old-sarum';
import { maidstone } from './maidstone';

export const airfields: Record<string, AirfieldContent> = {
  headcorn,
  'old-sarum': oldSarum,
  maidstone,
};

export function getAirfield(id: string): AirfieldContent | null {
  return airfields[id] ?? null;
}

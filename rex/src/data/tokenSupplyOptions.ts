export const TOKEN_SUPPLY_OPTIONS = [
  { value: '1000000', label: '1 million', shortLabel: '1M' },
  { value: '10000000', label: '10 million', shortLabel: '10M' },
  { value: '100000000', label: '100 million', shortLabel: '100M' },
  { value: '1000000000', label: '1 billion', shortLabel: '1B' },
  { value: '10000000000', label: '10 billion', shortLabel: '10B' },
  { value: '100000000000', label: '100 billion', shortLabel: '100B' },
  { value: '1000000000000', label: '1 trillion', shortLabel: '1T' },
] as const;

export type TokenSupplyValue = (typeof TOKEN_SUPPLY_OPTIONS)[number]['value'];

export const DEFAULT_TOKEN_SUPPLY: TokenSupplyValue = '1000000000';

export function formatTokenSupplyShort(value: string): string {
  return TOKEN_SUPPLY_OPTIONS.find((option) => option.value === value)?.shortLabel ?? value;
}

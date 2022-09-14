export function isValidDecimal(value: string, decimals: number) {
  return new RegExp(`^\\d+(\.)?(\\d{1,${decimals}})?$`).test(value);
}

export function map<T>(item: any): T {
  return item as unknown as T;
}
export function mapWithDestination<T, G>(item: G): T {
  return item as unknown as T;
}
export function mapArray<T, D>(item: D[]): T[] {
  return item as unknown as T[];
}

/**
 * Map settings update while the user is still typing. A lone "-" is not a
 * coordinate yet, and NaN makes Leaflet throw inside flyTo.
 */
export function finiteCoordinate(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

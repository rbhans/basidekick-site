export const STANDARD_ATMOSPHERE_PSI = 14.696;

export const thermistorPresets: Record<string, { label: string; r25: number; beta: number }> = {
  "10k-3892": { label: "10K NTC beta 3892", r25: 10000, beta: 3892 },
  "10k-3977": { label: "10K NTC beta 3977", r25: 10000, beta: 3977 },
  "3k-3977": { label: "3K NTC beta 3977", r25: 3000, beta: 3977 },
};

export const wireGaugeTable = [
  { gauge: "20", ohmsPer1000Ft: 10.15 },
  { gauge: "18", ohmsPer1000Ft: 6.385 },
  { gauge: "16", ohmsPer1000Ft: 4.016 },
  { gauge: "14", ohmsPer1000Ft: 2.525 },
  { gauge: "12", ohmsPer1000Ft: 1.588 },
  { gauge: "10", ohmsPer1000Ft: 0.999 },
];

export function hasInvalidNumbers(values: number[]) {
  return values.some((value) => Number.isNaN(value) || !Number.isFinite(value));
}

/**
 * Saturation vapor pressure over water (psi) for a dry-bulb temp in °F.
 * Uses the exp(77.345 + 0.0057T − 7235/T)/T^8.2 approximation, which takes
 * T in KELVIN and yields PASCALS; we convert °F→K and Pa→psi. (The old
 * basidekick-site version passed Rankine and mislabeled the result as psi,
 * producing ~millions and making enthalpy/humidity-ratio render blank —
 * corrected here.)
 */
export function saturationVaporPressurePsi(tempF: number): number {
  const kelvin = ((tempF - 32) * 5) / 9 + 273.15;
  const pascals = Math.exp(77.345 + 0.0057 * kelvin - 7235 / kelvin) / Math.pow(kelvin, 8.2);
  return pascals / 6894.757;
}

export function getHumidityRatio(tempF: number, relativeHumidity: number, pressurePsi = STANDARD_ATMOSPHERE_PSI) {
  const vaporPressure = Math.max(0, Math.min(1, relativeHumidity / 100)) * saturationVaporPressurePsi(tempF);
  if (vaporPressure >= pressurePsi) return Number.NaN;
  return (0.62198 * vaporPressure) / (pressurePsi - vaporPressure);
}

export function getMoistAirEnthalpy(tempF: number, relativeHumidity: number) {
  const humidityRatio = getHumidityRatio(tempF, relativeHumidity);
  if (!Number.isFinite(humidityRatio)) return Number.NaN;
  return 0.24 * tempF + humidityRatio * (1061 + 0.444 * tempF);
}

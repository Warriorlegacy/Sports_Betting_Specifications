import { OddsFormat } from '../types/sportsbook';

export function formatOdds(decimalOdds: number, format: OddsFormat = 'DECIMAL'): string {
  if (!decimalOdds || decimalOdds <= 1.0) return '1.01';

  switch (format) {
    case 'AMERICAN': {
      if (decimalOdds >= 2.0) {
        const american = Math.round((decimalOdds - 1) * 100);
        return `+${american}`;
      } else {
        const american = Math.round(-100 / (decimalOdds - 1));
        return `${american}`;
      }
    }
    case 'FRACTIONAL': {
      // Find clean fractional approximation
      const tolerance = 1.0e-3;
      let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
      let b = decimalOdds - 1;
      do {
        const a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
      } while (Math.abs((decimalOdds - 1) - h1 / k1) > (decimalOdds - 1) * tolerance && k1 < 100);

      // Simplify common fractions
      if (k1 === 1) return `${h1}/1`;
      return `${h1}/${k1}`;
    }
    case 'DECIMAL':
    default:
      return decimalOdds.toFixed(2);
  }
}

/**
 * Currency utilities for the Venezuelan market (Bs. / VES / USD).
 * Standardizes format with dot (.) as thousands separator and comma (,) as decimal separator.
 */

// Format number into Venezuelan locale: periods (.) for thousands, commas (,) for decimals
export const formatVeCurrency = (
  num: number,
  minDecimals = 2,
  maxDecimals = 2
): string => {
  if (isNaN(num) || !isFinite(num)) return '';
  const fixed = num.toFixed(maxDecimals);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  if (minDecimals === 0 && (!decPart || parseInt(decPart, 10) === 0)) {
    return formattedInt;
  }
  return `${formattedInt},${decPart || '00'}`;
};

// Parse Venezuelan formatted string (e.g., "325.380,48" or "1.000" or "411") into a float
export const parseVeCurrency = (val: string): number => {
  if (!val || val.trim() === '') return 0;
  // Strip all thousands periods, convert comma to dot decimal
  const normalized = val
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

// Format live typed input so periods and commas are inserted naturally
export const formatLiveInput = (val: string): string => {
  if (!val) return '';
  
  // Clean unwanted characters, keep digits, commas and dots
  const clean = val.replace(/[^\d.,]/g, '');
  if (!clean) return '';

  // Determine decimal position (user might type comma or dot on mobile keypad)
  // If both exist, last one is the decimal separator
  const lastCommaIndex = clean.lastIndexOf(',');
  const lastDotIndex = clean.lastIndexOf('.');

  let intRaw = '';
  let decRaw: string | null = null;

  if (lastCommaIndex !== -1 && lastCommaIndex >= lastDotIndex) {
    intRaw = clean.slice(0, lastCommaIndex).replace(/[\.,]/g, '');
    decRaw = clean.slice(lastCommaIndex + 1).replace(/[\.,]/g, '').slice(0, 2);
  } else if (lastDotIndex !== -1 && lastDotIndex > lastCommaIndex) {
    // If dot was typed at the end or as decimal
    const beforeDot = clean.slice(0, lastDotIndex).replace(/[\.,]/g, '');
    const afterDot = clean.slice(lastDotIndex + 1).replace(/[\.,]/g, '').slice(0, 2);
    // If dot is just a thousands separator candidate vs decimal:
    // If afterDot is <= 2 digits and it was the only separator or at the end, treat as decimal
    intRaw = beforeDot;
    decRaw = afterDot;
  } else {
    intRaw = clean.replace(/[\.,]/g, '');
  }

  // Format integer with periods for thousands
  const formattedInt = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (decRaw !== null) {
    return `${formattedInt},${decRaw}`;
  }
  if (clean.endsWith(',') || clean.endsWith('.')) {
    return `${formattedInt},`;
  }
  return formattedInt;
};

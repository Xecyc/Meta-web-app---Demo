/**
 * DolarAPI Venezuela Integration Service
 * Endpoint: https://ve.dolarapi.com/v1/dolares/oficial
 * Provides official Banco Central de Venezuela (BCV) USD/VES exchange rate in real time.
 */

export interface DolarApiResponse {
  moneda: string;
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

export interface BcvRateState {
  rate: number;
  source: string;
  lastUpdatedApi: string | null;
  lastFetchedLocal: string | null;
  isLoading: boolean;
  error: string | null;
  isAutoUpdated: boolean;
}

export const DOLAR_API_BCV_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

/**
 * Fetches the official BCV USD rate from DolarAPI Venezuela.
 */
export async function fetchBcvRateFromDolarApi(signal?: AbortSignal): Promise<{
  rate: number;
  lastUpdatedApi: string;
  lastFetchedLocal: string;
  source: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const combinedSignal = signal || controller.signal;
    const response = await fetch(DOLAR_API_BCV_URL, {
      signal: combinedSignal,
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Error en DolarAPI: HTTP ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as DolarApiResponse;

    const numericRate = typeof data.promedio === 'number' ? data.promedio : parseFloat(String(data.promedio));

    if (isNaN(numericRate) || numericRate <= 0) {
      throw new Error('Formato de tasa inválido recibido de DolarAPI');
    }

    // Return the sanitized rate rounded to 2 or 4 decimals if needed
    return {
      rate: Number(numericRate.toFixed(4)),
      lastUpdatedApi: data.fechaActualizacion || new Date().toISOString(),
      lastFetchedLocal: new Date().toISOString(),
      source: 'DolarAPI Venezuela (BCV Oficial)',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Formats an ISO date into Venezuelan friendly format (e.g. "01/09/2026 - 12:00 PM")
 */
export function formatBcvDate(isoString?: string | null): string {
  if (!isoString) return 'Sin registro';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    return new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Returns human-readable relative time (e.g. "Hace 2 minutos", "Hoy a las 4:00 PM")
 */
export function formatRelativeTime(isoString?: string | null): string {
  if (!isoString) return 'No disponible';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;

    return formatBcvDate(isoString);
  } catch {
    return 'Reciente';
  }
}

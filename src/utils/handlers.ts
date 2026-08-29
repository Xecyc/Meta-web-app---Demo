/**
 * Shared event and action handlers.
 */

export const resolveScannerHandler = (
  onOpenScanner?: () => void,
  onOpenQR?: () => void
) => () => (onOpenScanner ? onOpenScanner() : onOpenQR?.());

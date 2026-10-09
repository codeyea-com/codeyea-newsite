import 'server-only';
import { AppError } from '../errors';

export const stockSearchPausedMessage = 'External stock search is paused during the design milestone.';

export function isExternalStockSearchEnabled() {
  return process.env.EXTERNAL_STOCK_SEARCH_ENABLED === 'true';
}

export function requireExternalStockSearchEnabled() {
  if (!isExternalStockSearchEnabled()) throw new AppError(503, stockSearchPausedMessage);
}

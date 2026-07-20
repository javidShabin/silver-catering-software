import { reportCache } from '../modules/reports/reports.service.js';

/**
 * Safely invalidates all reporting caches.
 */
export const invalidateTenantReports = async () => {
  try {
    const prefixes = [
      `dashboard_summary:`,
      `financial_analytics:`,
      `monthly_trends:`,
      `top_items:`
    ];

    const keysToDelete = [];
    for (const key of reportCache.keys()) {
      if (prefixes.some(prefix => key.startsWith(prefix))) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      reportCache.delete(key);
    }
  } catch (err) {
    console.warn(`[Cache Invalidator] Failed to invalidate reports:`, err.message);
  }
};

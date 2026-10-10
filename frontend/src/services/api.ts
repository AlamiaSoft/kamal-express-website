/**
 * Central API Configuration & Helper
 * In production on Cloudflare Pages, requests are directed to https://api.kamalexpress.com.pk
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.kamalexpress.com.pk').replace(/\/+$/, '');

export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // If endpoint starts with /api, remove the leading /api to avoid double /api/api
  const normalized = cleanEndpoint.startsWith('/api/')
    ? cleanEndpoint.substring(4)
    : cleanEndpoint;
  return `${API_BASE_URL}${normalized}`;
}

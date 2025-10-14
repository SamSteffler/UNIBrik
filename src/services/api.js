// central API base helper
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export function url(path) {
  // ensure no double slashes
  return API_BASE.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

// Centralized API Base configuration
// Defaults to relative path '' so requests go through Next.js rewrites,
// avoiding mixed-content and CORS errors across tunnels and custom domains.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

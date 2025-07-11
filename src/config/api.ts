export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.gigsaathi.com",
  TIMEOUT: 10000, // 10 seconds
  CACHE_TTL: 60 * 5, // 5 minutes
} as const;

export const API_ENDPOINTS = {
  GENERAL_AGGREGATIONS: "/weekly-earnings-analytics/general-aggregations",
  WORK_AREA_WISE: "/weekly-earnings-analytics/work-area-wise",
} as const;

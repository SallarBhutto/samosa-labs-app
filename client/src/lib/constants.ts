export const SUBSCRIPTION_PLANS = {
  SOLO: 'Solo',
  TEAM: 'Team',
  ENTERPRISE: 'Enterprise',
} as const;

export const LICENSE_STATUS = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  INCOMPLETE: 'incomplete',
  TRIALING: 'trialing',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    USER: '/api/auth/user',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
  },
  SUBSCRIPTION: {
    PLANS: '/api/subscription-plans',
    USER_SUBSCRIPTION: '/api/user/subscription',
    CREATE: '/api/create-subscription',
  },
  LICENSE: {
    USER_KEYS: '/api/user/license-keys',
    VALIDATE: '/api/validate-license',
  },
  ADMIN: {
    USERS: '/api/admin/users',
    LICENSE_KEYS: '/api/admin/license-keys',
    STATS: '/api/admin/stats',
  },
} as const;

export const PLAN_FEATURES = {
  [SUBSCRIPTION_PLANS.SOLO]: [
    '1 License Key',
    'Basic Support',
    'API Access',
  ],
  [SUBSCRIPTION_PLANS.TEAM]: [
    'Up to 5 License Keys',
    'Team Management',
    'Priority Support',
    'Advanced Analytics',
  ],
  [SUBSCRIPTION_PLANS.ENTERPRISE]: [
    'Unlimited License Keys',
    'Advanced Team Management',
    '24/7 Dedicated Support',
    'Custom Integrations',
    'SLA Guarantee',
  ],
} as const;

export const PLAN_PRICES = {
  [SUBSCRIPTION_PLANS.SOLO]: 9,
  [SUBSCRIPTION_PLANS.TEAM]: 29,
  [SUBSCRIPTION_PLANS.ENTERPRISE]: 99,
} as const;

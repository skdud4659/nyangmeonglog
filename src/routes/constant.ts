export const ROUTE_GROUP = {
    AUTH: 'auth',
    ONBOARDING: 'onboarding',
} as const;

export const ROUTE_PATH = {
    HOME: '/',
    LOGIN: `/${ROUTE_GROUP.AUTH}/login`,
    SIGNUP: `/${ROUTE_GROUP.AUTH}/signup`,
    ONBOARDING: `/${ROUTE_GROUP.ONBOARDING}`,
} as const;

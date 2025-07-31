export const ROUTE_GROUP = {
    AUTH: 'auth',
} as const;

export const ROUTE_PATH = {
    HOME: '/',
    LOGIN: `/${ROUTE_GROUP.AUTH}/login`,
    SIGNUP: `/${ROUTE_GROUP.AUTH}/signup`,
} as const;

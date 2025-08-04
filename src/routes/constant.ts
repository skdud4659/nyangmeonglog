export const ROUTE_GROUP = {
    AUTH: 'auth',
    ONBOARDING: 'onboarding',
    HOME: 'home',
    WALK: 'walk',
    SCHEDULE: 'schedule',
    SETTING: 'setting',
    MY_PAGE: 'myPage',
} as const;

export const ROUTE_PATH = {
    LOGIN: `/${ROUTE_GROUP.AUTH}/login`,
    SIGNUP: `/${ROUTE_GROUP.AUTH}/signup`,
    ONBOARDING: `/${ROUTE_GROUP.ONBOARDING}`,
    HOME: `/${ROUTE_GROUP.HOME}`,
    WALK: `/${ROUTE_GROUP.WALK}`,
    SCHEDULE: `/${ROUTE_GROUP.SCHEDULE}`,
    SETTING: `/${ROUTE_GROUP.SETTING}`,
    MY_PAGE: `/${ROUTE_GROUP.MY_PAGE}`,
} as const;

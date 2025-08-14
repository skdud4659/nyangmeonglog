export const ROUTE_GROUP = {
    AUTH: 'auth',
    ONBOARDING: 'onboarding',
    MAIN: 'main',
    HOME: 'home',
    WALK: 'walk',
    SCHEDULE: 'schedule',
    MY_PAGE: 'myPage',
} as const;

export const ROUTE_PATH = {
    AUTH: {
        LOGIN: `/${ROUTE_GROUP.AUTH}/login`,
        SIGNUP: `/${ROUTE_GROUP.AUTH}/signup`,
    },
    ONBOARDING: {
        ROOT: `/${ROUTE_GROUP.ONBOARDING}`,
    },
    MAIN: {
        HOME: `/${ROUTE_GROUP.MAIN}/${ROUTE_GROUP.HOME}`,
        WALK: `/${ROUTE_GROUP.MAIN}/${ROUTE_GROUP.WALK}`,
        SCHEDULE: `/${ROUTE_GROUP.MAIN}/${ROUTE_GROUP.SCHEDULE}`,
        MY_PAGE: `/${ROUTE_GROUP.MAIN}/${ROUTE_GROUP.MY_PAGE}`,
    },
} as const;

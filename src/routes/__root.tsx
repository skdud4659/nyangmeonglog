import MainContainer from '@/features/main/MainContainer';
import { ROUTE_PATH } from '@/routes/constant';
import { supabase } from '@/shared/lib/supabase';
import { createRootRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router';

const RootComponent = () => {
    const { status, location } = useRouterState();
    const isPending = status === 'pending';
    const pathname = location.pathname;
    const isMainLayout =
        pathname.startsWith(ROUTE_PATH.MAIN.HOME) ||
        pathname.startsWith(ROUTE_PATH.MAIN.MY_PAGE) ||
        pathname.startsWith(ROUTE_PATH.MAIN.WALK) ||
        pathname.startsWith(ROUTE_PATH.MAIN.SCHEDULE);

    const content = isMainLayout ? (
        <MainContainer>
            <Outlet />
        </MainContainer>
    ) : (
        <Outlet />
    );

    return (
        <div>
            {isPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                </div>
            )}
            {content}
        </div>
    );
};

export const Route = createRootRoute({
    beforeLoad: async ({ location }) => {
        const isAuthRoute = location.pathname.startsWith('/auth');

        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session && !isAuthRoute) {
            throw redirect({ to: ROUTE_PATH.AUTH.LOGIN });
        }

        if (session && isAuthRoute) {
            throw redirect({ to: ROUTE_PATH.MAIN.HOME });
        }
    },
    component: RootComponent,
});

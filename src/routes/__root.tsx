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
        const pathname = location.pathname;
        const isAuthRoute = pathname.startsWith('/auth');
        const isOnboardingRoute = pathname.startsWith(ROUTE_PATH.ONBOARDING.ROOT);

        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session && !isAuthRoute) {
            throw redirect({ to: ROUTE_PATH.AUTH.LOGIN });
        }

        if (!session) return;

        if (session && isAuthRoute) {
            throw redirect({ to: ROUTE_PATH.MAIN.HOME });
        }

        if (!isOnboardingRoute) {
            const userId = session.user.id;
            const [profileRes, petsRes] = await Promise.all([
                supabase.from('profiles').select('display_name').eq('id', userId).single(),
                supabase
                    .from('pets')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', userId),
            ]);

            const displayName = profileRes.data?.display_name ?? '';
            const hasProfileName = typeof displayName === 'string' && displayName.trim().length > 0;
            const petsCount = petsRes.count ?? 0;
            const hasAnyPet = petsCount > 0;

            if (!hasProfileName && !hasAnyPet) {
                throw redirect({ to: ROUTE_PATH.ONBOARDING.ROOT });
            }
        }
    },
    component: RootComponent,
});

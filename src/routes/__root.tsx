import { ROUTE_PATH } from '@/routes/constant';
import { supabase } from '@/shared/lib/supabase';
import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createRootRoute({
    beforeLoad: async ({ location }) => {
        const isAuthRoute = location.pathname.startsWith('/auth');

        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session && !isAuthRoute) {
            throw redirect({ to: ROUTE_PATH.LOGIN });
        }

        if (session && isAuthRoute) {
            throw redirect({ to: ROUTE_PATH.HOME });
        }
    },
    component: () => (
        <div>
            <Outlet />
        </div>
    ),
});

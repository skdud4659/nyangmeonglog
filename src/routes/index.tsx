import { ROUTE_PATH } from '@/routes/constant';
import { supabase } from '@/shared/lib/supabase';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            throw redirect({ to: ROUTE_PATH.MAIN.HOME });
        }
        throw redirect({ to: ROUTE_PATH.AUTH.LOGIN });
    },
});

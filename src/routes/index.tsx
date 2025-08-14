import { ROUTE_PATH } from '@/routes/constant';
import { supabase } from '@/shared/lib/supabase';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
            throw redirect({ to: ROUTE_PATH.AUTH.LOGIN });
        }

        const userId = data.session.user.id;
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

        throw redirect({ to: ROUTE_PATH.MAIN.HOME });
    },
});

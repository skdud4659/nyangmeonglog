import SignupPage from '@/features/auth/pages/SignupPage';
import { ROUTE_PATH } from '@/routes/constant';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(ROUTE_PATH.SIGNUP)({
    component: SignupPage,
});

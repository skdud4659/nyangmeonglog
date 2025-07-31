import LoginPage from '@/features/auth/pages/LoginPage';
import { ROUTE_PATH } from '@/routes/constant';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(ROUTE_PATH.LOGIN)({
    component: LoginPage,
});

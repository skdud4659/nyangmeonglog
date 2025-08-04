import MainHomePage from '@/features/home/pages/MainHomePage';
import { ROUTE_PATH } from '@/routes/constant';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(ROUTE_PATH.HOME)({
    component: MainHomePage,
});

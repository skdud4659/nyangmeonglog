import MyPage from '@/features/myPage/pages/MyPage';
import { ROUTE_PATH } from '@/routes/constant';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(ROUTE_PATH.MY_PAGE)({
    component: MyPage,
});

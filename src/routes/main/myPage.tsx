import MyPage from '@/features/main/myPage/pages/MyPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/main/myPage')({
    component: MyPage,
});

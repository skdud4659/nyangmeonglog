import WalkHistoryPage from '@/features/main/walk/pages/WalkHistoryPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/main/walk/history')({
    component: WalkHistoryPage,
});

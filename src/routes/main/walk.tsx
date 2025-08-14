import WalkPage from '@/features/main/walk/pages/WalkPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/main/walk')({
    component: WalkPage,
});

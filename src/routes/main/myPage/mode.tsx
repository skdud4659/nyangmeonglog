import ModePage from '@/features/main/myPage/pages/ModePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/main/myPage/mode')({
    component: ModePage,
});

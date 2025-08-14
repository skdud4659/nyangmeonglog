import SchedulePage from '@/features/main/schedule/pages/SchedulePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/main/schedule')({
    component: SchedulePage,
});

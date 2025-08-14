import MainHomePage from '@/features/main/home/pages/MainHomePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/main/home')({
    component: MainHomePage,
});

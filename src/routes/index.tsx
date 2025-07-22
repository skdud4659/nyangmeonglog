import { createFileRoute } from '@tanstack/react-router';
import SignInPage from '@/pages/auth/signInPage';

export const Route = createFileRoute('/')({
    component: SignInPage,
});

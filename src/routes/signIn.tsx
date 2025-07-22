import { createFileRoute } from '@tanstack/react-router';
import SignIn from '@/pages/auth/signInPage';

export const Route = createFileRoute('/signIn')({
    component: SignIn,
});

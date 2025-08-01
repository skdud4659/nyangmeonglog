import OnboardingPage from '@/features/onBoarding/pages/OnboardingPage';
import { ROUTE_PATH } from '@/routes/constant';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(ROUTE_PATH.ONBOARDING)({
    component: OnboardingPage,
});

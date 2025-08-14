import OnboardingPage from '@/features/onBoarding/pages/OnboardingPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding/')({
    component: OnboardingPage,
});

import PetFormPage from '@/features/main/myPage/pages/PetFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/main/myPage/petForm')({
    component: PetFormPage,
});

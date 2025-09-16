import WalkDetailPage from '@/features/main/walk/pages/WalkDetailPage';
import { createFileRoute, useParams } from '@tanstack/react-router';

const DetailWrapper = () => {
    const { id } = useParams({ strict: false }) as { id: string };
    return <WalkDetailPage id={id} />;
};

export const Route = createFileRoute('/main/walk/history_/$id')({
    component: DetailWrapper,
});

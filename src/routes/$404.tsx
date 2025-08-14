import { ROUTE_PATH } from '@/routes/constant';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/$404')({
    component: () => (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white text-gray-800">
            <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
            <Link
                to={ROUTE_PATH.MAIN.HOME}
                className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
            >
                홈으로 이동
            </Link>
        </div>
    ),
});

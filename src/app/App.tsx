import { routeTree } from '@/routeTree.gen';
import { useAuthStore } from '@/shared/store/authStore';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

const router = createRouter({ routeTree });

const App = () => {
    const initialize = useAuthStore(s => s.initialize);
    useEffect(() => {
        void initialize();
    }, [initialize]);
    return (
        <div className="relative min-h-screen bg-white">
            <RouterProvider router={router} />
        </div>
    );
};

export default App;

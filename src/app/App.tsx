import { routeTree } from '@/routeTree.gen';
import { RouterProvider, createRouter } from '@tanstack/react-router';

const router = createRouter({ routeTree });

const App = () => {
    return (
        <div className="relative min-h-screen bg-white">
            <RouterProvider router={router} />
        </div>
    );
};

export default App;

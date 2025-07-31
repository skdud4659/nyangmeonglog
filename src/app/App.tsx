import { routeTree } from '@/routeTree.gen';
import { RouterProvider, createRouter } from '@tanstack/react-router';

const router = createRouter({ routeTree });

const App = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <RouterProvider router={router} />
        </div>
    );
};

export default App;

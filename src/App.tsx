import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

function App() {
    return (
        <div className="min-h-screen bg-gray-100">
            <RouterProvider router={router} />
        </div>
    );
}

export default App;

import { Outlet } from '@tanstack/react-router';

const AuthRoot = () => {
    return (
        <div className="min-h-screen bg-white">
            <Outlet />
        </div>
    );
};

export default AuthRoot;

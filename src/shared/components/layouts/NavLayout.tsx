import BottomNavigation from '@/shared/components/molecules/BottomNavigation';
import type { ReactNode } from 'react';

interface NavLayoutProps {
    children: ReactNode;
}

const NavLayout = ({ children }: NavLayoutProps) => {
    return (
        <div className="flex flex-col h-screen font-sans relative">
            {/* 메인 컨텐츠 */}
            <div className="flex flex-col flex-1 overflow-y-auto">{children}</div>

            {/* 하단 네비게이션 */}
            <BottomNavigation />
        </div>
    );
};

export default NavLayout;

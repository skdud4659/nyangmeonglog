import BottomNavigation from '@/features/main/BottomNavigation';
import type { ReactNode } from 'react';

interface MainContainerProps {
    children: ReactNode;
}

const MainContainer = ({ children }: MainContainerProps) => {
    return (
        <div className="flex flex-col h-screen font-sans relative">
            {/* 메인 컨텐츠 */}
            <div className="flex flex-col flex-1 overflow-y-auto">{children}</div>

            {/* 하단 네비게이션 */}
            <BottomNavigation />
        </div>
    );
};

export default MainContainer;

import { ROUTE_PATH } from '@/routes/constant';
import { usePetStore } from '@/shared/store/petStore';
import { Link, useLocation } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Calendar, ClipboardClock, PawPrint, User } from 'lucide-react';

const BottomNavigation = () => {
    const pets = usePetStore(state => state.pets);
    const activePetId = usePetStore(state => state.activePetId);
    const activePet = pets.find(p => p.id === activePetId);

    const baseItems = [
        {
            icon: Calendar,
            label: '캘린더',
            isActive: false,
            hasNotification: false,
            to: ROUTE_PATH.MAIN.HOME,
        },
        {
            icon: ClipboardClock,
            label: '일정',
            isActive: false,
            hasNotification: true,
            to: ROUTE_PATH.MAIN.SCHEDULE,
        },
        {
            icon: User,
            label: '프로필',
            isActive: false,
            hasNotification: false,
            to: ROUTE_PATH.MAIN.MY_PAGE,
        },
    ];

    const navItems =
        activePet?.species === 'dog'
            ? [
                  {
                      icon: PawPrint,
                      label: '펫',
                      isActive: false,
                      hasNotification: false,
                      to: ROUTE_PATH.MAIN.WALK,
                  },
                  ...baseItems,
              ]
            : baseItems;

    const { pathname } = useLocation();
    const isActive = (path: string) => pathname === path;
    return (
        <nav className="bg-white border-t border-gray-100 px-6 py-3">
            <div className="flex items-center justify-around">
                {navItems.map(item => (
                    <motion.button
                        key={item.label}
                        className="relative flex flex-col items-center space-y-1 p-2 rounded-lg"
                        whileTap={{ scale: 0.9 }}
                    >
                        <Link to={item.to}>
                            <item.icon
                                size={23}
                                color={isActive(item.to) ? '#F38E8E' : '#C4C4C4'}
                            />
                        </Link>
                    </motion.button>
                ))}
            </div>
        </nav>
    );
};

export default BottomNavigation;

import { ROUTE_PATH } from '@/routes/constant';
import { useAuthStore } from '@/shared/store/authStore';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, LogOut, Settings, User, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type MenuEntry = {
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
    rightElement?: ReactNode;
    disabled?: boolean;
};

const Spinner = () => (
    <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"
        aria-label="loading"
    />
);

const MenuItem = ({ icon: Icon, label, onClick, rightElement, disabled }: MenuEntry) => (
    <motion.button
        whileTap={disabled ? undefined : { scale: 0.95 }}
        className={`flex items-center justify-between px-4 py-4 border-b border-gray-100 w-full bg-white hover:bg-gray-50 ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
    >
        <div className="flex items-center space-x-3">
            <Icon className="text-[#F38E8E]" size={20} />
            <span className="text-gray-700 font-medium">{label}</span>
        </div>
        {rightElement ?? <ChevronRight className="text-gray-400" size={20} />}
    </motion.button>
);

export const SettingsMenu = () => {
    const navigate = useNavigate();
    const signOut = useAuthStore(s => s.signOut);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
            navigate({ to: ROUTE_PATH.LOGIN });
        } finally {
            setIsLoggingOut(false);
        }
    };

    const menus: MenuEntry[] = [
        { icon: User, label: '동물정보 수정' },
        { icon: Bell, label: '알림설정' },
        { icon: Settings, label: '모드 변경' },
        {
            icon: LogOut,
            label: '로그아웃',
            onClick: handleLogout,
            rightElement: isLoggingOut ? <Spinner /> : undefined,
            disabled: isLoggingOut,
        },
    ];

    return (
        <div className="mt-2">
            {menus.map((m, i) => (
                <MenuItem
                    key={i}
                    icon={m.icon}
                    label={m.label}
                    onClick={m.onClick}
                    rightElement={m.rightElement}
                    disabled={m.disabled}
                />
            ))}
        </div>
    );
};

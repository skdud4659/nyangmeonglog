import { motion } from 'framer-motion';
import { Bell, Settings, User } from 'lucide-react';

const MenuItem = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-between px-4 py-4 border-b border-gray-100 w-full bg-white hover:bg-gray-50"
    >
        <div className="flex items-center space-x-3">
            <Icon className="text-[#F38E8E]" size={20} />
            <span className="text-gray-700 font-medium">{label}</span>
        </div>
        <span className="text-gray-400">&gt;</span>
    </motion.button>
);

export const SettingsMenu = () => {
    const menus = [
        { icon: User, label: '동물정보 수정' },
        { icon: Bell, label: '알림설정' },
        { icon: Settings, label: '모드 변경' },
    ];

    return (
        <div className="mt-2">
            {menus.map((m, i) => (
                <MenuItem key={i} icon={m.icon} label={m.label} />
            ))}
        </div>
    );
};

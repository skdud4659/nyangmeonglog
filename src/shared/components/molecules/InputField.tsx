import CalendarIcon from '@/shared/assets/icons/calendarIcon.svg?react';
import ClearIcon from '@/shared/assets/icons/clearIcon.svg?react';
import IconButton from '@/shared/components/atoms/IconButton';
import { Eye, EyeOff } from 'lucide-react';
import { useRef } from 'react';

type InputFieldProps = {
    label: string;
    type?: 'text' | 'password' | 'date' | 'number' | 'email';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear?: () => void;
    error?: string;
    success?: boolean;
    showPasswordToggle?: boolean;
    showClearButton?: boolean;
    onTogglePassword?: () => void;
    placeholder?: string;
};

const InputField = ({
    label,
    type = 'text',
    value,
    onChange,
    onClear,
    error,
    success,
    showPasswordToggle,
    showClearButton = true,
    onTogglePassword,
    placeholder,
}: InputFieldProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="relative flex-1">
            <label className="block mb-2 text-sm text-gray_7">{label}</label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full border-b outline-none pr-8
                        ${
                            error
                                ? 'border-red-500 text-red-500'
                                : success
                                  ? 'border-green-500 text-green-700'
                                  : 'border-gray_3 text-gray_9'
                        }
                        ${type === 'date' ? '[appearance:none] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden' : ''}
                    `}
                />

                <div className="absolute right-0 bottom-2 flex items-center gap-2">
                    {type === 'date' && (
                        <IconButton
                            icon={<CalendarIcon className="w-4 h-4 text-gray_5" />}
                            onClick={() => inputRef.current?.showPicker()}
                        />
                    )}
                    {showPasswordToggle && (
                        <button
                            type="button"
                            onClick={onTogglePassword}
                            className="p-1 text-gray_5"
                        >
                            {type === 'password' ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    )}
                    {value && showClearButton && type !== 'date' && (
                        <IconButton
                            icon={<ClearIcon className="w-5 h-5 text-gray_5" />}
                            onClick={onClear}
                        />
                    )}
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            {success && !error && (
                <p className="mt-1 text-xs text-green-500">비밀번호가 일치합니다.</p>
            )}
        </div>
    );
};

export default InputField;

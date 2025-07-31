import ClearIcon from '@/shared/assets/icons/clearIcon.svg?react';
import IconButton from '@/shared/components/atoms/IconButton';
import { Eye, EyeOff } from 'lucide-react';

type InputFieldProps = {
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    error?: string;
    success?: boolean;
    showPasswordToggle?: boolean;
    onTogglePassword?: () => void;
    placeholder?: string;
};

const InputField = ({
    label,
    type,
    value,
    onChange,
    onClear,
    error,
    success,
    showPasswordToggle,
    onTogglePassword,
    placeholder,
}: InputFieldProps) => {
    return (
        <div className="relative w-full mb-8">
            <label className="block mb-2 text-sm text-gray_7">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full border-b outline-none
              ${
                  error
                      ? 'border-red-500 text-red-500'
                      : success
                        ? 'border-green-500 text-green-700'
                        : 'border-gray_3 text-gray_9'
              }`}
                />
                <div className="absolute right-0 bottom-2 flex items-center gap-2">
                    {showPasswordToggle && (
                        <button
                            type="button"
                            onClick={onTogglePassword}
                            className="p-1 text-gray_5"
                        >
                            {type === 'password' ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    )}
                    {value && (
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

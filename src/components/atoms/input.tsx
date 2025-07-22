import { type InputHTMLAttributes, forwardRef } from 'react';

type Props = {
    label: string;
    error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, ...props }, ref) => {
    return (
        <div>
            <label className="block mb-2 text-sm text-gray_7">{label}</label>
            <input
                ref={ref}
                className="w-full border-b text-sm font-semibold text-gray_8"
                {...props}
            />
            {error && <p className="mt-1 text-xs text-error">{error}</p>}
        </div>
    );
});

export default Input;

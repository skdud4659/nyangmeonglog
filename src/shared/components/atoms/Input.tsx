import { forwardRef, type InputHTMLAttributes } from 'react';

type InputProps = {
    error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ error, ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={`w-full text-md bg-transparent border-b outline-none transition-colors
        ${error ? 'border-error' : 'border-gray_3 focus:border-primary'}`}
            {...props}
        />
    );
});

export default Input;

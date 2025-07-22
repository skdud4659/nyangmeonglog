import { type ButtonHTMLAttributes } from 'react';

type Props = {
    label?: string;
    variant?: 'primary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    shape?: 'square' | 'round';
    children?: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
    label,
    variant = 'primary',
    size = 'md',
    shape = 'round',
    children,
    ...props
}: Props) => {
    const style =
        variant === 'primary'
            ? 'bg-primary text-white'
            : 'bg-transparent text-primary border border-primary';

    const sizeStyle =
        size === 'sm' ? 'py-2 text-sm' : size === 'md' ? 'py-3 text-sm' : 'py-4 text-lg';

    const shapeStyle = shape === 'round' ? 'rounded-4xl' : 'rounded-none';

    return (
        <button
            className={`w-full text-sm font-medium ${style} ${sizeStyle} ${shapeStyle}`}
            {...props}
        >
            {label}
            {children}
        </button>
    );
};

export default Button;

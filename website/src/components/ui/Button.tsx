import Link from 'next/link';
import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'outline';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export default function Button({
  children,
  href,
  variant = 'primary',
  className,
  onClick,
  type = 'button',
  disabled,
}: ButtonProps) {
  const baseClasses = clsx(
    variant === 'primary' ? 'btn-primary' : 'btn-outline',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {children}
    </button>
  );
}

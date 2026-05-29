import clsx from 'clsx';

interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
}

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  value,
  onChange,
  className,
  rows = 4,
}: InputProps) {
  const inputClasses = clsx('input-field', className);

  return (
    <div className="relative">
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder || label}
          required={required}
          value={value}
          onChange={onChange}
          rows={rows}
          className={clsx(inputClasses, 'resize-none')}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder || label}
          required={required}
          value={value}
          onChange={onChange}
          className={inputClasses}
        />
      )}
    </div>
  );
}

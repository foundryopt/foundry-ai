import clsx from 'clsx';

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

export function FilterChip({ label, active, onClick, className }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors min-h-tap',
        active
          ? 'bg-blue-50 border-blue-300 text-blue-700'
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
        className,
      )}
    >
      {label}
    </button>
  );
}

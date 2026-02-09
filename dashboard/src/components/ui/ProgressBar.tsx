import clsx from 'clsx';

interface ProgressBarProps {
  percent: number;
  color?: string;
  bgColor?: string;
  height?: string;
}

export function ProgressBar({
  percent,
  color = 'bg-blue-500',
  bgColor = 'bg-gray-200',
  height = 'h-2',
}: ProgressBarProps) {
  return (
    <div className={clsx('w-full rounded-full overflow-hidden', bgColor, height)}>
      <div
        className={clsx('rounded-full transition-all', color, height)}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

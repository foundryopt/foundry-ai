import type { DeepLink } from '@/lib/types';

interface DeepLinkButtonProps {
  link: DeepLink;
}

const TARGET_ICONS: Record<string, string> = {
  Smartsheet: '📊',
  Slack: '💬',
  Sheet: '📋',
  Email: '✉️',
  Doc: '📄',
  Fieldwire: '🏗️',
  Adaptive: '💰',
  CompanyCam: '📸',
};

export function DeepLinkButton({ link }: DeepLinkButtonProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors min-h-tap min-w-tap"
    >
      <span>{TARGET_ICONS[link.target] ?? '🔗'}</span>
      <span>{link.label}</span>
    </a>
  );
}

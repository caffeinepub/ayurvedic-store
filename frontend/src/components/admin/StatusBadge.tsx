import { ProductStatus } from '../../backend';

interface StatusBadgeProps {
  status: ProductStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  [ProductStatus.visible]: {
    label: 'Visible',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  [ProductStatus.outOfStock]: {
    label: 'Out of Stock',
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
  [ProductStatus.launchingSoon]: {
    label: '🚀 Launching Soon',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  [ProductStatus.featured]: {
    label: '⭐ Featured',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  [ProductStatus.notVisible]: {
    label: 'Not Visible',
    className: 'bg-gray-100 text-gray-500 border border-gray-200',
  },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[ProductStatus.visible];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}

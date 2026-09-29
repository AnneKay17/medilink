// Badge component - displays status or severity labels
// Supports severity levels (life-threatening, severe, moderate, mild)
// and status types (active, pending, verified, etc.)
// Uses both color AND icon/text to communicate (not color alone)

const severityConfig = {
  'life-threatening': {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    icon: '⚠️',
  },
  'severe': {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    icon: '⚠️',
  },
  'moderate': {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-900',
    icon: '⚠️',
  },
  'mild': {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    icon: null,
  },
};

const statusConfig = {
  'active': {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
  },
  'pending': {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-900',
  },
  'verified': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
  },
  'rejected': {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
  },
  'discontinued': {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
  },
};

export const Badge = ({ variant, children }) => {
  // Determine if this is a severity or status variant
  const config = severityConfig[variant] || statusConfig[variant];

  if (!config) {
    console.warn(`Badge variant "${variant}" not found`);
    return null;
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-3 py-1.5
        border rounded
        text-sm font-medium
        ${config.bg}
        ${config.border}
        ${config.text}
      `}
      role="status"
      aria-label={`${variant}: ${children}`}
    >
      {config.icon && <span aria-hidden="true">{config.icon}</span>}
      {children}
    </span>
  );
};
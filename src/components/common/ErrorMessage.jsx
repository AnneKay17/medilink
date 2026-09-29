// ErrorMessage component - displays error or warning messages prominently
// Used for form validation, API errors, network errors, etc.

export const ErrorMessage = ({ 
  message,                // Required: error text
  type = 'error',        // 'error' (red) or 'warning' (yellow)
  onDismiss = null       // Optional: callback for dismiss button
}) => {
  const typeConfig = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      icon: '⚠️',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`
        flex items-start gap-3
        p-4 border-l-4
        rounded
        ${config.bg}
        ${config.border}
        ${config.text}
      `}
      role="alert"
      aria-live="assertive"
      aria-describedby="error-message"
    >
      {/* Icon */}
      <span className="flex-shrink-0 text-lg" aria-hidden="true">
        {config.icon}
      </span>

      {/* Message Container */}
      <div className="flex-1">
        <p id="error-message" className="text-sm">
          {message}
        </p>
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-lg hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
};
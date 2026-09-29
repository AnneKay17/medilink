// EmptyState component - displays friendly message when there's no data
// Used when: no allergies, no medications, no search results, etc.

export const EmptyState = ({ 
  title,                  // Required: main headline
  description,            // Required: supporting text
  actionLabel = null,     // Optional: button text
  onAction = null         // Optional: callback when button clicked
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center gap-4 py-12 px-4"
      role="status"
      aria-live="polite"
    >
      {/* Icon / Emoji */}
      <div className="text-5xl" aria-hidden="true">
        📋
      </div>

      {/* Headline */}
      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-center max-w-sm">
        {description}
      </p>

      {/* Optional Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={actionLabel}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
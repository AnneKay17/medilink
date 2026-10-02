// LoadingSpinner component - displays animated spinner while loading
// Used when fetching medical records, searching patients, etc.

export const LoadingSpinner = ({ 
  size = 'md',        // 'sm', 'md', 'lg'
  message = null 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div 
      className="flex flex-col items-center justify-center gap-4 p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Spinner */}
      <div
        className={`
          ${sizeClasses[size]}
          border-4 border-gray-200 border-t-blue-600
          rounded-full
          animate-spin
        `}
        aria-hidden="true"
      />

      {/* Optional message */}
      {message && (
        <p className="text-gray-600 text-sm text-center">
          {message}
        </p>
      )}
    </div>
  );
};
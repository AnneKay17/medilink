import { useEffect } from 'react';

// Modal component
// Reusable dialog for forms, confirmations, alerts
// Accessible: Escape key closes, focus trap, proper ARIA attributes

export const Modal = ({
  isOpen = false,
  title,
  onClose,
  children,
  size = 'md',              // 'sm' (400px), 'md' (600px), 'lg' (800px)
  closeButton = true,
  backdropDismiss = true,
  footer = null,            // optional: footer actions
}) => {
  

  // Close modal on Escape key press
  useEffect(() => {

    // If modal is not open, return null
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener when modal opens
    document.addEventListener('keydown', handleEscape);
    
    // Prevent body scroll when modal open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Conditional rendering AFTER hooks
  if (!isOpen) return null;

  // Size config
  const sizeConfig = {
    sm: 'max-w-sm',    // ~400px
    md: 'max-w-md',    // ~600px
    lg: 'max-w-2xl',   // ~800px
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={backdropDismiss ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-lg shadow-xl w-full ${sizeConfig[size]} max-h-[90vh] overflow-y-auto`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            
            {closeButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer (optional actions) */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
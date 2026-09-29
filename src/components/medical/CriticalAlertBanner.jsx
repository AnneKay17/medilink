// CriticalAlertBanner component
// Displays prominent red alert for life-threatening or severe allergies
// Must be impossible to miss - shown at top of medical record

export const CriticalAlertBanner = ({ 
  allergyName,      // e.g., "Penicillin"
  severity,         // "life-threatening" or "severe"
  reaction          // e.g., "Anaphylaxis"
}) => {
  if (!severity || (severity !== 'life-threatening' && severity !== 'severe')) {
    return null; // Only show for critical allergies
  }

  const isLifeThreatening = severity === 'life-threatening';

  return (
    <div
      className={`
        flex items-start gap-4 p-4 mb-6 rounded-lg
        ${isLifeThreatening 
          ? 'bg-red-50 border-l-4 border-red-600' 
          : 'bg-red-50 border-l-4 border-red-500'
        }
      `}
      role="alert"
      aria-live="assertive"
      aria-labelledby="critical-allergy-title"
    >
      {/* Icon */}
      <div className="flex-shrink-0 text-3xl" aria-hidden="true">
        ⚠️
      </div>

      {/* Content */}
      <div className="flex-1">
        <h2 
          id="critical-allergy-title"
          className={`
            text-lg font-bold mb-1
            ${isLifeThreatening ? 'text-red-900' : 'text-red-900'}
          `}
        >
          CRITICAL ALLERGY: {allergyName}
        </h2>
        <p className="text-red-800 text-base font-medium">
          Reaction: {reaction}
        </p>
        {isLifeThreatening && (
          <p className="text-red-700 text-sm mt-2">
            This allergy can cause severe, life-threatening reactions.
          </p>
        )}
      </div>
    </div>
  );
};
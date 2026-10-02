import { Card } from '../common/Card';
import { formatDate } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

// MedicalTimeline component
// Displays chronological timeline of medical events (diagnoses, medications, visits, etc.)
// Events are sorted with most recent first

const eventTypeConfig = {
  diagnosis: {
    label: 'Diagnosis',
    color: 'border-blue-400 bg-blue-50',
    dotColor: 'bg-blue-400',
  },
  medication: {
    label: 'Medication',
    color: 'border-green-400 bg-green-50',
    dotColor: 'bg-green-400',
  },
  allergy: {
    label: 'Allergy',
    color: 'border-red-400 bg-red-50',
    dotColor: 'bg-red-400',
  },
  visit: {
    label: 'Visit',
    color: 'border-gray-400 bg-gray-50',
    dotColor: 'bg-gray-400',
  },
  procedure: {
    label: 'Procedure',
    color: 'border-purple-400 bg-purple-50',
    dotColor: 'bg-purple-400',
  },
  other: {
    label: 'Clinical Note',
    color: 'border-gray-400 bg-gray-50',
    dotColor: 'bg-gray-400',
  },
};

export const MedicalTimeline = ({ 
  events = [], 
  isLoading = false, 
  error = null 
}) => {
  // Show loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading medical history..." />;
  }

  // Show error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Show empty state
  if (!events || events.length === 0) {
    return (
      <EmptyState 
        title="No medical history"
        description="No clinical records available yet."
      />
    );
  }

  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div 
      className="space-y-1"
      role="region"
      aria-label="Medical timeline"
    >
      {/* Timeline items */}
      {sortedEvents.map((event, index) => {
        const config = eventTypeConfig[event.type] || eventTypeConfig.other;
        const isLast = index === sortedEvents.length - 1;

        return (
          <div key={event.id} className="relative">
            {/* Vertical line (connects events) */}
            {!isLast && (
              <div
                className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-300"
                aria-hidden="true"
              />
            )}

            {/* Timeline item */}
            <div className="flex gap-4 mb-4">
              {/* Dot */}
              <div className="flex-shrink-0 mt-2">
                <div
                  className={`w-4 h-4 rounded-full ${config.dotColor} border-2 border-white shadow-md`}
                  aria-hidden="true"
                />
              </div>

              {/* Content card */}
              <Card className="flex-1">
                {/* Header: Date + Type Badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <time className="text-sm font-medium text-gray-700">
                    {formatDate(event.date)}
                  </time>
                  <span 
                    className={`inline-block px-2 py-1 rounded text-xs font-medium text-gray-700 ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-base font-semibold text-gray-900 mb-1">
                  {event.title}
                </h4>

                {/* Description (if available) */}
                {event.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {event.description}
                  </p>
                )}

                {/* Attribution: facility + clinician */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-2 border-t border-gray-200">
                  {event.facility && (
                    <span>
                      <span className="font-medium text-gray-700">Facility:</span> {event.facility}
                    </span>
                  )}
                  {event.clinician && (
                    <span>
                      <span className="font-medium text-gray-700">Clinician:</span> {event.clinician}
                    </span>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
};
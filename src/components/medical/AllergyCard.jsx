import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

// AllergyCard component
// Displays a single allergy with severity, reaction, and attribution

export const AllergyCard = ({
  allergyName,          // e.g., "Penicillin"
  severity,            // "life-threatening", "severe", "moderate", "mild"
  reaction,            // e.g., "Anaphylaxis", "Rash", "Digestive upset"
  recordedDate,        // ISO date string
  recordingFacility,   // e.g., "Clinic B"
  recordingClinician   // e.g., "Dr. Johnson"
}) => {
  return (
    <Card>
      {/* Header: Name + Severity Badge */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {allergyName}
        </h3>
        <Badge variant={severity}>
          {reaction}
        </Badge>
      </div>

      {/* Details: When and where recorded */}
      <div className="space-y-2 text-sm text-gray-600">
        <div>
          <span className="font-medium text-gray-700">Recorded:</span> {formatDate(recordedDate)}
        </div>
        <div>
          <span className="font-medium text-gray-700">Facility:</span> {recordingFacility}
        </div>
        <div>
          <span className="font-medium text-gray-700">Clinician:</span> {recordingClinician}
        </div>
      </div>
    </Card>
  );
};
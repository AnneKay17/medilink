import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

// ConditionCard component
// Displays a single condition (diagnosis) with status and attribution

export const ConditionCard = ({
  conditionName,         // e.g., "Hypertension"
  status,               // "active" or "resolved"
  onsetDate,            // ISO date string
  diagnosingFacility,   // e.g., "Hospital A"
  diagnosingClinician   // e.g., "Dr. Smith"
}) => {
  return (
    <Card>
      {/* Header: Name + Status Badge */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {conditionName}
        </h3>
        <Badge variant={status}>
          {status === 'active' ? 'Active' : 'Resolved'}
        </Badge>
      </div>

      {/* Details: When diagnosed and by whom */}
      <div className="space-y-2 text-sm text-gray-600">
        <div>
          <span className="font-medium text-gray-700">Diagnosed:</span> {formatDate(onsetDate)}
        </div>
        <div>
          <span className="font-medium text-gray-700">Facility:</span> {diagnosingFacility}
        </div>
        <div>
          <span className="font-medium text-gray-700">Clinician:</span> {diagnosingClinician}
        </div>
      </div>
    </Card>
  );
};
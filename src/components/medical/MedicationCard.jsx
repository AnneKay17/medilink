import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

// MedicationCard component
// Displays a single medication with dosage, frequency, and prescriber info

export const MedicationCard = ({
  medicationName,        // e.g., "Lisinopril"
  dosage,               // e.g., "10mg"
  frequency,            // e.g., "Once daily"
  status,               // "active" or "discontinued"
  prescribingClinician, // e.g., "Dr. Smith"
  prescribingFacility,  // e.g., "Hospital A"
  prescribedDate        // ISO date string
}) => {
  return (
    <Card>
      {/* Header: Name + Status Badge */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {medicationName}
        </h3>
        <Badge variant={status}>
          {status === 'active' ? 'Active' : 'Discontinued'}
        </Badge>
      </div>

      {/* Dosage and Frequency - prominent */}
      <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-100">
        <div className="text-sm">
          <div className="text-blue-900 font-medium">{dosage}</div>
          <div className="text-blue-800">{frequency}</div>
        </div>
      </div>

      {/* Prescription details */}
      <div className="space-y-2 text-sm text-gray-600">
        <div>
          <span className="font-medium text-gray-700">Prescribed:</span> {formatDate(prescribedDate)}
        </div>
        <div>
          <span className="font-medium text-gray-700">Facility:</span> {prescribingFacility}
        </div>
        <div>
          <span className="font-medium text-gray-700">Clinician:</span> {prescribingClinician}
        </div>
      </div>
    </Card>
  );
};
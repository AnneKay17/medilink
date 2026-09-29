import { Card } from '../common/Card';

// FamilyHistoryCard component
// Displays one privacy-preserving family history entry.

export const FamilyHistoryCard = ({
  condition,
  ageAtDiagnosis,
}) => {
  return (
    <Card>
      {/* Condition */}
      <div>
        <h4 className="text-base font-semibold text-gray-900">
          {condition}
        </h4>
      </div>

      {/* Approximate age at diagnosis */}
      {ageAtDiagnosis && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-gray-700">
            Approximate age at diagnosis:
          </span>{' '}
          {ageAtDiagnosis}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 italic">
        Family history is documented clinical information. Discuss appropriate
        screening with your healthcare professional.
      </div>
    </Card>
  );
};
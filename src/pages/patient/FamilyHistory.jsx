import { PatientLayout } from '../../layouts/PatientLayout';
import { FamilyHistoryCard } from '../../components/medical/FamilyHistoryCard';
import { mockFamilyHistory } from '../../data/mockMedicalData';
import { Card } from '../../components/common/Card';

// Converts an exact age into a less identifying age range.
const getAgeRange = (age) => {
  if (!age) return null;

  const decade = Math.floor(age / 10) * 10;
  return `${decade}s`;
};

// Patient: Family History
// Family history is displayed in privacy-preserving groups.

export const FamilyHistory = () => {
  const immediateFamily = mockFamilyHistory.filter((entry) =>
    ['Mother', 'Father', 'Sister', 'Brother'].includes(entry.relative)
  );

  const maternalFamily = mockFamilyHistory.filter((entry) =>
    entry.relative.toLowerCase().includes('maternal')
  );

  const paternalFamily = mockFamilyHistory.filter((entry) =>
    entry.relative.toLowerCase().includes('paternal')
  );

  const renderFamilyGroup = (title, entries) => {
    if (entries.length === 0) return null;

    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>

        <div className="space-y-3">
          {entries.map((entry) => (
            <FamilyHistoryCard
              key={entry.id}
              condition={entry.condition}
              ageAtDiagnosis={getAgeRange(entry.ageAtDiagnosis)}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <PatientLayout currentPage="Family History">
      <div className="space-y-8">
        {/* Page title */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Family History
          </h1>

          <p className="text-gray-600">
            Health conditions reported in your family that may be relevant to
            your care.
          </p>
        </section>

        {/* Privacy notice */}
        <Card className="bg-blue-50 border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>🔒 Privacy:</strong> Family history is shown in a
            privacy-preserving format. It describes relevant health conditions
            reported in your family without identifying specific relatives or
            exposing their personal medical information.
          </p>
        </Card>

        {/* Clinical context notice */}
        <Card className="bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-gray-700">
            <strong>⚠️ Important:</strong> Family history provides clinical
            context about health conditions reported in your family. It is not
            a diagnosis or a prediction of your future health. Discuss any
            concerns with your healthcare professional.
          </p>
        </Card>

        {/* Family history groups */}
        {mockFamilyHistory.length > 0 ? (
          <div className="space-y-10">
            {renderFamilyGroup('Immediate Family', immediateFamily)}
            {renderFamilyGroup('Maternal Family', maternalFamily)}
            {renderFamilyGroup('Paternal Family', paternalFamily)}
          </div>
        ) : (
          <Card>
            <p className="text-gray-600">
              No family history recorded.
            </p>
          </Card>
        )}
      </div>
    </PatientLayout>
  );
};
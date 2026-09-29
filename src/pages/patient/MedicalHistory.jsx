import { PatientLayout } from '../../layouts/PatientLayout';
import { MedicalTimeline } from '../../components/medical/MedicalTimeline';
import { mockTimelineEvents } from '../../data/mockMedicalData';
import { Card } from '../../components/common/Card';

// Patient: Medical History
// Chronological timeline of all medical events

export const MedicalHistory = () => {
  return (
    <PatientLayout currentPage="Medical History">
      <div className="space-y-8">
        {/* Page title */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical History</h1>
          <p className="text-gray-600">
            Complete timeline of your medical events, diagnoses, medications, and visits
          </p>
        </section>

        {/* Timeline */}
        <section className="space-y-4">
          <MedicalTimeline events={mockTimelineEvents} />
        </section>

        {/* Info */}
        <Card className="bg-blue-50 border border-blue-100">
          <p className="text-sm text-gray-700">
            <strong>ℹ️ Your medical records:</strong> This is a complete history of all your clinical events, 
            maintained across multiple healthcare providers. Your records travel with you to ensure continuity of care.
          </p>
        </Card>
      </div>
    </PatientLayout>
  );
};
// Temporary file to test medical history components

import { MedicalTimeline } from '../../components/medical/MedicalTimeline';
import { FamilyHistoryCard } from '../../components/medical/FamilyHistoryCard';
import { mockTimelineEvents, mockFamilyHistory } from '../../data/mockMedicalData';

export const HistoryComponentShowcase = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-12">
        
        {/* Medical Timeline */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Medical Timeline</h2>
          <MedicalTimeline events={mockTimelineEvents} />
        </section>

        {/* Timeline - Loading State */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Timeline - Loading State</h2>
          <MedicalTimeline 
            events={[]} 
            isLoading={true}
          />
        </section>

        {/* Timeline - Error State */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Timeline - Error State</h2>
          <MedicalTimeline 
            events={[]} 
            error="Failed to load medical history. Please try again."
          />
        </section>

        {/* Timeline - Empty State */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Timeline - Empty State</h2>
          <MedicalTimeline events={[]} />
        </section>

        {/* Family History */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Family History</h2>
          <div className="space-y-3">
            {mockFamilyHistory.map(entry => (
              <FamilyHistoryCard 
                key={entry.id}
                relative={entry.relative}
                condition={entry.condition}
                ageAtDiagnosis={entry.ageAtDiagnosis}
                notes={entry.notes}
              />
            ))}
          </div>
        </section>

        {/* Family History - Single Entry */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Family History - Single Entry</h2>
          <FamilyHistoryCard 
            relative="Mother"
            condition="Type 2 Diabetes"
            ageAtDiagnosis={52}
            notes="Diagnosed in 2015. Well-controlled with medication."
          />
        </section>

      </div>
    </div>
  );
};
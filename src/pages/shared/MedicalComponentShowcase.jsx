// Temporary file to test medical components
// Shows all components with mock data

import { CriticalAlertBanner } from '../../components/medical/CriticalAlertBanner';
import { AllergyCard } from '../../components/medical/AllergyCard';
import { ConditionCard } from '../../components/medical/ConditionCard';
import { MedicationCard } from '../../components/medical/MedicationCard';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';

import { mockAllergies, mockConditions, mockMedications } from '../../data/mockMedicalData';

export const MedicalComponentShowcase = () => {
  // Find critical allergy for banner
  const criticalAllergy = mockAllergies.find(
    a => a.severity === 'life-threatening' || a.severity === 'severe'
  );

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-12">
        
        {/* Critical Alert Banner */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Critical Alert Banner</h2>
          {criticalAllergy && (
            <CriticalAlertBanner 
              allergyName={criticalAllergy.allergyName}
              severity={criticalAllergy.severity}
              reaction={criticalAllergy.reaction}
            />
          )}
        </section>

        {/* Allergies */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Allergies</h2>
          <div className="space-y-3">
            {mockAllergies.map(allergy => (
              <AllergyCard 
                key={allergy.id}
                allergyName={allergy.allergyName}
                severity={allergy.severity}
                reaction={allergy.reaction}
                recordedDate={allergy.recordedDate}
                recordingFacility={allergy.recordingFacility}
                recordingClinician={allergy.recordingClinician}
              />
            ))}
          </div>
        </section>

        {/* Conditions */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Conditions</h2>
          <div className="space-y-3">
            {mockConditions.map(condition => (
              <ConditionCard 
                key={condition.id}
                conditionName={condition.conditionName}
                status={condition.status}
                onsetDate={condition.onsetDate}
                diagnosingFacility={condition.diagnosingFacility}
                diagnosingClinician={condition.diagnosingClinician}
              />
            ))}
          </div>
        </section>

        {/* Medications */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Medications</h2>
          <div className="space-y-3">
            {mockMedications.map(med => (
              <MedicationCard 
                key={med.id}
                medicationName={med.medicationName}
                dosage={med.dosage}
                frequency={med.frequency}
                status={med.status}
                prescribingClinician={med.prescribingClinician}
                prescribingFacility={med.prescribingFacility}
                prescribedDate={med.prescribedDate}
              />
            ))}
          </div>
        </section>

        {/* Empty States Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Empty States</h2>
          <div className="space-y-6">
            <Card>
              <EmptyState 
                title="No family history recorded"
                description="No documented family medical history on file."
              />
            </Card>
            <Card>
              <EmptyState 
                title="No clinical notes"
                description="No additional clinical notes available."
              />
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
};
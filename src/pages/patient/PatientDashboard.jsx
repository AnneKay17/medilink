import { useAuth } from '../../hooks/useAuth';
import { PatientLayout } from '../../layouts/PatientLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { CriticalAlertBanner } from '../../components/medical/CriticalAlertBanner';
// eslint-disable-next-line no-unused-vars
import { AllergyCard } from '../../components/medical/AllergyCard';
import { ConditionCard } from '../../components/medical/ConditionCard';
import { Button } from '../../components/common/Button';
import { noomsaMedicalRecord } from '../../data/mockMedicalData';
import { Link } from 'react-router-dom';

// Patient Dashboard
// Overview of patient's health status
// Shows critical alerts, active conditions, recent medications

export const PatientDashboard = () => {
  const { user } = useAuth();

  // Get patient's medical data (using mock data for now)
  const medicalData = noomsaMedicalRecord;
  const criticalAllergies = medicalData.allergies.filter(
    a => a.severity === 'life-threatening' || a.severity === 'severe'
  );
  const activeConditions = medicalData.conditions.filter(c => c.status === 'active');
  const activeMedications = medicalData.medications.filter(m => m.status === 'active');

  return (
    <PatientLayout currentPage="Dashboard">
      <div className="space-y-8">
        {/* Welcome section */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Patient'}
          </h1>
          <p className="text-gray-600">
            Here's your health overview. Keep track of your conditions, medications, and allergies.
          </p>
        </section>

        {/* Critical alerts */}
        {criticalAllergies.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Critical Alerts</h2>
            {criticalAllergies.map(allergy => (
              <CriticalAlertBanner
                key={allergy.id}
                allergyName={allergy.allergyName}
                severity={allergy.severity}
                reaction={allergy.reaction}
              />
            ))}
          </section>
        )}

        {/* Active conditions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Active Conditions</h2>
            <Link to="/patient/medical-history">
              <Button variant="ghost" size="sm">
                View all →
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {activeConditions.length > 0 ? (
              activeConditions.map(condition => (
                <ConditionCard
                  key={condition.id}
                  conditionName={condition.conditionName}
                  status={condition.status}
                  onsetDate={condition.onsetDate}
                  diagnosingFacility={condition.diagnosingFacility}
                  diagnosingClinician={condition.diagnosingClinician}
                />
              ))
            ) : (
              <p className="text-gray-600">No active conditions recorded.</p>
            )}
          </div>
        </section>

        {/* Active medications */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Current Medications</h2>
            <Link to="/patient/my-health">
              <Button variant="ghost" size="sm">
                View all →
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {activeMedications.length > 0 ? (
              activeMedications.map(med => (
                <Card key={med.id} className="bg-blue-50 border border-blue-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{med.medicationName}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {med.dosage} • {med.frequency}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{med.notes}</p>
                    </div>
                    <Badge variant="active">Taking</Badge>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-600">No medications recorded.</p>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/patient/medical-assistance">
              <Button variant="primary" fullWidth>
                🆘 Request Assistance
              </Button>
            </Link>
            <Link to="/patient/healthcare-finder">
              <Button variant="secondary" fullWidth>
                🏥 Find Healthcare
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </PatientLayout>
  );
};
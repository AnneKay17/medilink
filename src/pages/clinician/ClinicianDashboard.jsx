import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';

// Clinician dashboard
// Main landing page for clinicians
export const ClinicianDashboard = () => {
  return (
    <div className="space-y-6">

      {/* Welcome section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Clinician Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Manage patient records and access verified medical information.
        </p>
      </div>

      {/* Primary action */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Find a Patient
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Search for a patient to view their authorized medical record.
            </p>
          </div>

          <Link
            to="/clinician/patients"
            className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search Patients
          </Link>
        </div>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Search patients */}
          <Link to="/clinician/patients">
            <Card className="h-full hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">
                🔍
              </div>

              <h3 className="font-semibold text-gray-900">
                Search Patients
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                Find a patient's verified medical information.
              </p>
            </Card>
          </Link>

          {/* Medical assistance */}
          <Link to="/clinician/assistance">
            <Card className="h-full hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">
                🆘
              </div>

              <h3 className="font-semibold text-gray-900">
                Medical Assistance
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                Review patient requests for medical assistance.
              </p>
            </Card>
          </Link>

          {/* Audit activity */}
          <Link to="/clinician/audit">
            <Card className="h-full hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">
                📋
              </div>

              <h3 className="font-semibold text-gray-900">
                Audit Activity
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                View activity related to patient records.
              </p>
            </Card>
          </Link>

        </div>
      </div>

      {/* Recent activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              Recent actions in MediLink.
            </p>
          </div>
        </div>

        {/* Demo activity */}
        <div className="space-y-4">

          <div className="flex gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />

            <div>
              <p className="text-sm text-gray-900">
                Patient record viewed
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Demo activity
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />

            <div>
              <p className="text-sm text-gray-900">
                Medical record updated
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Demo activity
              </p>
            </div>
          </div>

        </div>
      </Card>

    </div>
  );
};
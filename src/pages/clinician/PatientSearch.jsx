import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { searchPatients } from '../../data/mockPatients';

// Patient search page
// Allows clinicians to find patients by name, ID, or email
export const PatientSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = searchPatients(searchTerm);

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Search Patients
        </h1>

        <p className="mt-2 text-gray-600">
          Find a patient to view their authorized medical information.
        </p>
      </div>

      {/* Search */}
      <Card>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by patient name, ID, or email..."
        />
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Patient Results
          </h2>

          <span className="text-sm text-gray-500">
            {filteredPatients.length} result
            {filteredPatients.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredPatients.length === 0 ? (
          <EmptyState
            title="No patients found"
            message="Try searching using a different name, patient ID, or email."
          />
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  {/* Patient information */}
                  <div className="flex items-start gap-4">

                    {/* Avatar */}
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold">
                        {patient.name.charAt(0)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {patient.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Patient ID: {patient.id}
                      </p>

                      <p className="text-sm text-gray-500">
                        Date of birth: {patient.dateOfBirth}
                      </p>

                      <p className="text-sm text-gray-500">
                        {patient.email}
                      </p>
                    </div>
                  </div>

                  {/* Patient gender */}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">
                      Gender:
                    </span>{' '}
                    {patient.gender}
                  </div>

                  {/* View patient */}
                  <Link
                    to={`/clinician/patients/${patient.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Record
                  </Link>

                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
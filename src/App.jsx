import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

//temp
import { ComponentShowcase } from './pages/shared/ComponentShowcase';
import { MedicalComponentShowcase } from './pages/shared/MedicalComponentShowcase';
import { HistoryComponentShowcase } from './pages/shared/HistoryComponentShowcase';


// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Shared Pages
import { Unauthorized } from './pages/shared/Unauthorized';
import { NotFound } from './pages/shared/NotFound';

//patient
import { PatientLayout } from './layouts/PatientLayout';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { MyHealth } from './pages/patient/MyHealth';
import { MedicalHistory } from './pages/patient/MedicalHistory';
import { FamilyHistory } from './pages/patient/FamilyHistory';
import { HealthcareFinder } from './pages/patient/HealthcareFinder';
import { MedicalAssistance } from './pages/patient/MedicalAssistance';

import { FacilityDetails } from './pages/patient/FacilityDetails';

//Clinician
import { ClinicianLayout } from './layouts/ClinicianLayout';
import { ClinicianDashboard } from './pages/clinician/ClinicianDashboard';
import { PatientSearch } from './pages/clinician/PatientSearch';
import { PatientMedicalRecord } from './pages/clinician/PatientMedicalRecord';
import { AddClinicalRecord } from './pages/clinician/AddClinicalRecord';
import { ClinicianMedicalAssistance } from './pages/clinician/ClinicianMedicalAssistance';
import { AuditActivity } from './pages/clinician/AuditActivity';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  const {user, isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

        {/* Shared Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />

        {/* Temporary Redirect */}
       
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" />
            ) : user.role === 'patient' ? (
              <Navigate to="/patient/dashboard" />
            ) : (
              <Navigate to="/clinician/dashboard" />
            )
          }
        />

        {/* Patient Routes (PLACEHOLDER - will add pages next) */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute requiredRole="patient">
             <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/my-health"
          element={
            <ProtectedRoute requiredRole="patient">
              <MyHealth />
            </ProtectedRoute>
          }
        />
    
        <Route
          path="/patient/medical-history"
          element={
            <ProtectedRoute requiredRole="patient">
              <MedicalHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/family-history"
          element={
            <ProtectedRoute requiredRole="patient">
              <FamilyHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/healthcare-finder"
          element={
            <ProtectedRoute requiredRole="patient">
              <HealthcareFinder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/medical-assistance"
          element={
            <ProtectedRoute requiredRole="patient">
              <MedicalAssistance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient/healthcare/:facilityId"
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientLayout currentPage="Healthcare Finder">
                <FacilityDetails />
              </PatientLayout>
            </ProtectedRoute>
          }
        />

        {/* Clinician Routes (PLACEHOLDER - will add pages next) */}
        <Route
          path="/clinician/dashboard"
          element={
            <ProtectedRoute requiredRole="clinician">
              <ClinicianLayout currentPage="Dashboard">
                <ClinicianDashboard />
              </ClinicianLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clinician/patients"
          element={
            <ProtectedRoute requiredRole="clinician">
              <ClinicianLayout currentPage="Search Patients">
                <PatientSearch />
              </ClinicianLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clinician/patients/:patientId"
          element={
            <ProtectedRoute requiredRole="clinician">
              <ClinicianLayout currentPage="Search Patients">
                <PatientMedicalRecord />
              </ClinicianLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clinician/patients/:patientId/add-record"
          element={
            <ProtectedRoute requiredRole="clinician">
              <ClinicianLayout currentPage="Search Patients">
                <AddClinicalRecord />
              </ClinicianLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clinician/assistance"
          element={
            <ProtectedRoute requiredRole="clinician">
              <ClinicianLayout currentPage="Medical Assistance">
                <ClinicianMedicalAssistance />
              </ClinicianLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clinician/audit"
          element={
            <ProtectedRoute requiredRole="clinician">
              <ClinicianLayout currentPage="Audit Activity">
                <AuditActivity />
              </ClinicianLayout>
            </ProtectedRoute>
          }
        />

        {/*<Route 
          path="/patient/dashboard" 
          element={<ProtectedRoute component={PatientDashboard} requiredRole="patient" />} 
        />
        <Route 
          path="/patient/my-health" 
          element={<ProtectedRoute component={MyHealth} requiredRole="patient" />} 
        />
        <Route 
          path="/patient/medical-history" 
          element={<ProtectedRoute component={MedicalHistory} requiredRole="patient" />} 
        />
        <Route 
          path="/patient/family-history" 
          element={<ProtectedRoute component={FamilyHistory} requiredRole="patient" />} 
        />
        <Route 
          path="/patient/healthcare-finder" 
          element={<ProtectedRoute component={HealthcareFinder} requiredRole="patient" />} 
        />
        <Route 
          path="/patient/medical-assistance" 
          element={<ProtectedRoute component={MedicalAssistance} requiredRole="patient" />} 
        />*/}

<Route path="/showcase" element={<ComponentShowcase />} />
<Route path="/medical-showcase" element={<MedicalComponentShowcase />} />
      <Route path="/history-showcase" element={<HistoryComponentShowcase />} />
      </Routes>
    </Router>
  )
}

export default App

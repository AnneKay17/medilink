import { useState } from 'react';
import { PatientHeader } from '../components/patient/PatientHeader';
import { PatientNavigation } from '../components/patient/PatientNavigation';

// Patient layout wrapper
// Used by all patient-facing pages
// Header + Navigation + Main content area
export const PatientLayout = ({ children, currentPage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <PatientHeader
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <div className="flex">
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={handleCloseSidebar}
          />
        )}

        {/* Navigation Sidebar */}
        <PatientNavigation
          currentPage={currentPage}
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
        />

        {/* Main content area */}
        <main className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
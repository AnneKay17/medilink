import { useState } from 'react';
import { ClinicianHeader } from '../components/clinician/ClinicianHeader';
import { ClinicianNavigation } from '../components/clinician/ClinicianNavigation';

// Clinician layout wrapper
// Used by all clinician-facing pages
// Header + Navigation + Main content area
export const ClinicianLayout = ({ children, currentPage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <ClinicianHeader
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
        <ClinicianNavigation
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
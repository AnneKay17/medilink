import { Link } from 'react-router-dom';

// Clinician navigation sidebar
// Links to all clinician pages
const navItems = [
  {
    label: 'Dashboard',
    path: '/clinician/dashboard',
    icon: '📊',
  },
  {
    label: 'Search Patients',
    path: '/clinician/patients',
    icon: '🔍',
  },
  {
    label: 'Medical Assistance',
    path: '/clinician/assistance',
    icon: '🆘',
  },
  {
    label: 'Audit Activity',
    path: '/clinician/audit',
    icon: '📋',
  },
];

export const ClinicianNavigation = ({
  currentPage,
  isOpen,
  onClose,
}) => {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 p-6
        transform transition-transform duration-300 ease-in-out
        md:static md:z-auto md:w-64 md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Mobile close button */}
      <div className="flex justify-end mb-4 md:hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`
              block w-full text-left px-4 py-3 rounded-lg transition-colors
              ${
                currentPage === item.label
                  ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-500 pl-3'
                  : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
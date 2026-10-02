import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

// Patient page header
// Shows patient name, avatar, logout button
export const PatientHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
        
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
          >
            ☰
          </button>

          {/* Logo */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            MediLink
          </h1>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || 'Patient'}
            </p>
            <p className="text-xs text-gray-500">
              Patient Account
            </p>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {user?.name?.charAt(0) || 'P'}
            </span>
          </div>

          {/* Logout button */}
          <Button
            variant="ghost"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
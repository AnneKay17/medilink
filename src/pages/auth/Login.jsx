import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export const Login = () => {
  const [email, setEmail] = useState('patient@example.com'); // Pre-filled for demo
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const user = await login(email, password);
      // Navigate based on role
      if (user.role === 'patient') {
        navigate('/patient/dashboard');
      } else if (user.role === 'clinician') {
        navigate('/clinician/dashboard');
      }
    } catch (err) {
    console.error('Login failed:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-blue-600 mb-2">🏥 MediLink</div>
          <p className="text-gray-600">Your health history, wherever your care takes you</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h1>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Demo: patient@example.com</p>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Demo: password123</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="mb-4"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Demo Accounts:</p>
            <button
              onClick={() => {
                setEmail('patient@example.com');
                setPassword('password123');
              }}
              className="w-full text-left p-3 text-sm border border-gray-200 rounded hover:bg-gray-50 mb-2"
            >
              <div className="font-medium">Patient</div>
              <div className="text-gray-600 text-xs">patient@example.com</div>
            </button>
            <button
              onClick={() => {
                setEmail('clinician@example.com');
                setPassword('password123');
              }}
              className="w-full text-left p-3 text-sm border border-gray-200 rounded hover:bg-gray-50"
            >
              <div className="font-medium">Clinician</div>
              <div className="text-gray-600 text-xs">clinician@example.com</div>
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline font-medium">
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
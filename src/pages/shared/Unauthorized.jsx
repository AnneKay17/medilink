import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-2">403</h1>
        <p className="text-2xl font-semibold text-gray-700 mb-4">Unauthorized</p>
        <p className="text-gray-600 mb-8">You do not have permission to access this page.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')}>Go Home</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    </div>
  );
};
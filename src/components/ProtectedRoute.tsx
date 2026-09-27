import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStudent } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { student, loading } = useStudent();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
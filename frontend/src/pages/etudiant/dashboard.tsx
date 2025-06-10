import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@/components/ui/button';

export default function EtudiantDashboard() {
  const { logout } = useAuth();

  return (
    <ProtectedRoute requiredRole="ETUDIANT">
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Etudiant Dashboard</h1>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to your Dashboard</h2>
            <p>This is the student dashboard. Only students can access this page.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

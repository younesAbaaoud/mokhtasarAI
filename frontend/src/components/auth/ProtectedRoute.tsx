import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from "@/contexts/AuthContext";

type UserRole = 'ETUDIANT' | 'PROFESSEUR';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.role !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      if (user?.role === 'ETUDIANT') {
        router.push('/etudiant/dashboard');
      } else if (user?.role === 'PROFESSEUR') {
        router.push('/professeur/dashboard');
      }
    }
  }, [isAuthenticated, user?.role, requiredRole, router]);

  if (!isAuthenticated || user?.role !== requiredRole) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
} 
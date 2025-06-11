import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function withRoleGuard<P>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[]
) {
  return function RoleGuard(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.replace("/auth/login");
        } else if (!allowedRoles.includes(user.role)) {
          // Redirect to the correct dashboard
          if (user.role === "PROFESSEUR") router.replace("/professeur/dashboard");
          else if (user.role === "ETUDIANT") router.replace("/etudiant/dashboard");
          else router.replace("/auth/login");
        }
      }
    }, [user, loading, router]);

    if (loading || !user || !allowedRoles.includes(user.role)) {
      return null; // Or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };
} 
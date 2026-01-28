import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute component
 * Redirects unauthenticated users to login page
 * Optionally requires admin role
 */
export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(redirectTo, { replace: true });
      } else if (requireAdmin && !isAdmin) {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, isAdmin, requireAdmin, navigate, redirectTo]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or not admin (when required)
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * PublicRoute component
 * Redirects authenticated users away from public pages (like login/register)
 */
export function PublicRoute({ 
  children, 
  redirectTo = "/" 
}: { 
  children: ReactNode; 
  redirectTo?: string;
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user is already authenticated
  if (user) {
    return null;
  }

  return <>{children}</>;
}

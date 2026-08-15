import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Route guard for routes that require authentication.
 */
export function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the location so they can return
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Route guard for routes that require a specific user role.
 */
export function RoleRoute({ allowedRoles, children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.user.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role to lowercase to handle any casing issues
  const userRole = user?.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

  if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * Route guard for pages that should only be accessed by unauthenticated users (e.g. Login, Register).
 */
export function PublicOnlyRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.user.user);

  if (isAuthenticated && user) {
    const role = user.role?.toLowerCase();
    if (role === "student") {
      return <Navigate to="/student" replace />;
    } else if (role === "mentor") {
      return <Navigate to="/mentor" replace />;
    } else if (role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

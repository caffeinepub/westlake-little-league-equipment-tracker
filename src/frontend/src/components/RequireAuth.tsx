import { Navigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth({
  children,
}: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  if (!currentUser) {
    return <Navigate to="/login" search={{ redirect: currentPath }} />;
  }

  return <>{children}</>;
}

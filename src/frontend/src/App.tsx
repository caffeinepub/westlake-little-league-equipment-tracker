import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import IssueEquipment from "./pages/IssueEquipment";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import Returns from "./pages/Returns";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Public routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: Signup,
});

// Protected layout wrapper route
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: () => (
    <RequireAuth>
      <Layout>
        <Outlet />
      </Layout>
    </RequireAuth>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/",
  component: Dashboard,
});

const inventoryRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/inventory",
  component: Inventory,
});

const issueRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/issue",
  component: IssueEquipment,
});

const returnsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/returns",
  component: Returns,
});

const reportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/reports",
  component: Reports,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/settings",
  component: Settings,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    inventoryRoute,
    issueRoute,
    returnsRoute,
    reportsRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}

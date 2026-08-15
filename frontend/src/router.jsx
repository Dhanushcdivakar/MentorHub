import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import PageLoader from "./components/PageLoader";
import { ProtectedRoute, RoleRoute, PublicOnlyRoute } from "./components/RouteGuards";

// Suspense Layout Wrapper
import SuspenseLayout from "./router/SuspenseLayout";

// Lazy-loaded Pages Registry
import * as Pages from "./router/lazy-pages";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        element: <SuspenseLayout />,
        children: [
          {
            path: "/",
            element: <Pages.Home />,
          },
          {
            path: "/about",
            element: <Pages.About />,
          },
        ],
      },
    ],
  },

  {
    element: <AuthLayout />,
    children: [
      {
        element: <SuspenseLayout />,
        children: [
          {
            path: "/login",
            element: (
              <PublicOnlyRoute>
                <Pages.Login />
              </PublicOnlyRoute>
            ),
          },
          {
            path: "/register",
            element: (
              <PublicOnlyRoute>
                <Pages.Register />
              </PublicOnlyRoute>
            ),
          },
          {
            path: "/forgot-password",
            element: (
              <PublicOnlyRoute>
                <Pages.ForgotPassword />
              </PublicOnlyRoute>
            ),
          },
          {
            path: "/reset-password",
            element: (
              <PublicOnlyRoute>
                <Pages.ResetPassword />
              </PublicOnlyRoute>
            ),
          },
        ],
      },
    ],
  },

  {
    path: "/student",
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={["student"]}>
          <DashboardLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        element: <SuspenseLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/student/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <Pages.StudentDashboard />,
          },
          {
            path: "sessions",
            element: <Pages.StudentSessions />,
          },
          {
            path: "book/:mentorId",
            element: <Pages.BookSession />,
          },
          {
            path: "ai-mentor",
            element: <Pages.AIMentor />,
          },
        ],
      },
    ],
  },

  {
    path: "/mentor",
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={["mentor"]}>
          <DashboardLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        element: <SuspenseLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/mentor/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <Pages.MentorDashboard />,
          },
          {
            path: "sessions",
            element: <Pages.MentorSessions />,
          },
          {
            path: "availability",
            element: <Pages.MentorAvailability />,
          },
          {
            path: "books",
            element: <Pages.AdminBooks />,
          },
          {
            path: "ai-mentor",
            element: <Pages.AIMentor />,
          },
        ],
      },
    ],
  },

  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={["admin"]}>
          <DashboardLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        element: <SuspenseLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <Pages.AdminDashboard />,
          },
          {
            path: "books",
            element: <Pages.AdminBooks />,
          },
        ],
      },
    ],
  },

  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        element: <SuspenseLayout />,
        children: [
          {
            path: "/books",
            element: <Pages.Books />,
          },
          {
            path: "/mentors",
            element: (
              <RoleRoute allowedRoles={["student", "admin"]}>
                <Pages.Mentors />
              </RoleRoute>
            ),
          },
          {
            path: "/profile",
            element: <Pages.Profile />,
          },
        ],
      },
    ],
  },

  {
    path: "/unauthorized",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Pages.Unauthorized />
      </Suspense>
    ),
  },

  {
    path: "*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Pages.NotFound />
      </Suspense>
    ),
  },
]);

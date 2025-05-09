import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { PrivateRoute, PublicRoute } from "./RouteGuards";
import { MainLayout } from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";

// Lazy load all pages
const Login = lazy(() =>
  import("@pages/Login").then((module) => ({ default: module.Login }))
);
const SignUp = lazy(() =>
  import("@pages/SignUp").then((module) => ({ default: module.SignUp }))
);
const ForgotPassword = lazy(() =>
  import("@pages/ForgotPassword").then((module) => ({
    default: module.ForgotPassword,
  }))
);
const ResetPassword = lazy(() =>
  import("@pages/ResetPassword").then((module) => ({
    default: module.ResetPassword,
  }))
);
const Home = lazy(() =>
  import("@pages/Home").then((module) => ({ default: module.Home }))
);
const Admin = lazy(() =>
  import("@pages/Admin").then((module) => ({ default: module.Admin }))
);
const Profile = lazy(() =>
  import("@pages/Profile").then((module) => ({ default: module.Profile }))
);
const RateCake = lazy(() =>
  import("@pages/RateCake").then((module) => ({ default: module.RateCake }))
);
const CakeHistory = lazy(() =>
  import("@pages/CakeHistory").then((module) => ({
    default: module.CakeHistory,
  }))
);
const UploadCake = lazy(() =>
  import("@pages/UploadCake").then((module) => ({ default: module.UploadCake }))
);
const CakeDetails = lazy(() =>
  import("@pages/CakeDetails").then((module) => ({
    default: module.CakeDetails,
  }))
);
const NotFound = lazy(() =>
  import("@pages/NotFound").then((module) => ({ default: module.NotFound }))
);

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "/cake-upload",
        element: (
          <PrivateRoute>
            <UploadCake />
          </PrivateRoute>
        ),
      },
      {
        path: "/rate/:cakeId",
        element: (
          <PrivateRoute>
            <RateCake />
          </PrivateRoute>
        ),
      },
      {
        path: "/cake-history",
        element: (
          <PrivateRoute>
            <CakeHistory />
          </PrivateRoute>
        ),
      },
      {
        path: "/cake-history/:id",
        element: (
          <PrivateRoute>
            <CakeDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "/profile/:userId?",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <PrivateRoute requireAdmin={true}>
            <Admin />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "/signup",
        element: (
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

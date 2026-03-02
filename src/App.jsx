import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Layout from "./Components/SharedComponents/Layout";
import SocialLayout from "./Components/SharedComponents/SocialLayout";
import Home from "./Components/Home/Home";
import Register from "./Components/Register/Register";
import Login from "./Components/Login/Login";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import ChangePassword from "./Components/ChangePassword/ChangePassword";
import AuthContextProvider from "./Context/AuthContextProvider";
import ProtectedRoutes from "./Components/SharedComponents/ProtectedRoutes";
import Profile from "./Components/Profile/Profile";
import Explore from "./Components/Explore/Explore";
import AuthProtected from "./Components/SharedComponents/AuthProtected";
import Notifications from "./Components/Notifications/Notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostDetails from "./Components/PostDetails/PostDetails";
import UserProfile from "./Components/UserProfile/UserProfile";
import { useNetworkState } from "react-use";
import DetectOffline from "./Components/DetectOffline/DetectOffline";

export default function App() {
  const query = new QueryClient();
  const { online } = useNetworkState();

  const routes = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="/home" replace /> },

        {
          element: <SocialLayout />,
          children: [
            {
              path: "home",
              element: (
                <ProtectedRoutes>
                  <Home />
                </ProtectedRoutes>
              ),
            },
            {
              path: "explore",
              element: (
                <ProtectedRoutes>
                  <Explore />
                </ProtectedRoutes>
              ),
            },
          ],
        },

        {
          path: "notifications",
          element: (
            <ProtectedRoutes>
              <Notifications />
            </ProtectedRoutes>
          ),
        },
        {
          path: "postdetails/:id",
          element: (
            <ProtectedRoutes>
              <PostDetails />
            </ProtectedRoutes>
          ),
        },
        {
          path: "profile",
          element: (
            <ProtectedRoutes>
              <Profile />
            </ProtectedRoutes>
          ),
        },
        {
          path: "userprofile/:id",
          element: (
            <ProtectedRoutes>
              <UserProfile />
            </ProtectedRoutes>
          ),
        },
        {
          path: "change",
          element: (
            <ProtectedRoutes>
              <ChangePassword />
            </ProtectedRoutes>
          ),
        },
        {
          path: "login",
          element: (
            <AuthProtected>
              <Login />
            </AuthProtected>
          ),
        },
        {
          path: "register",
          element: (
            <AuthProtected>
              <Register />
            </AuthProtected>
          ),
        },
      ],
    },
  ]);

  return (
    <>
      <DetectOffline show={!online} />
      <QueryClientProvider client={query}>
        <AuthContextProvider>
          <HeroUIProvider>
            <div className="fixed z-9999">
              <div className="block lg:hidden">
                <ToastProvider placement="top-center" toastOffset={90} />
              </div>
              <div className="hidden lg:block">
                <ToastProvider placement="bottom-right" />
              </div>
            </div>
            <RouterProvider router={routes} />
          </HeroUIProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </>
  );
}

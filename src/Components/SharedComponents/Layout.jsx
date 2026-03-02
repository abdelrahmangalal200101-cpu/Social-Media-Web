import React from "react";
import MyNavbar from "../Navbar/Navbar";
import { Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const { pathname } = useLocation();
  const isAuthPage = ["/login", "/register"].includes(pathname);

  return (
    <div className="font-cairo min-h-screen bg-purple-50/30">
      <MyNavbar />
      {isAuthPage ? (
        <Outlet />
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </main>
      )}
    </div>
  );
}
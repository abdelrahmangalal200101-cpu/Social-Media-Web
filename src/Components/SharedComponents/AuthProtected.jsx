import React from "react";
import { Navigate } from "react-router-dom";

export default function AuthProtected({ children }) {
  if (!localStorage.getItem("Token")) {
    return <>{children}</>;
  } else {
    return <Navigate to="/home"  />;
  }
}

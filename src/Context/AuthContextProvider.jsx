import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {
  const [islogin, setLogin] = useState(null);
  const [loggedId, setLoggedId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (token) {
      setLogin(token);
      const decodeObj = jwtDecode(token);
      setLoggedId(decodeObj.user);
    }
  }, []);

  function getMyProfile() {
    return axios.get(
      "https://route-posts.routemisr.com/users/profile-data",
      {
        headers: {
          Authorization: `Bearer ${islogin}`,
        },
      }
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
    enabled: !!islogin, 
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const user = data?.data?.data?.user;
  
  return (
    <AuthContext.Provider
      value={{
        islogin,
        setLogin,
        loggedId,
        user,
        profileLoading: isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
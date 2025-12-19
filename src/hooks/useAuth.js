// hooks/useAuth.js
import { useState, useEffect } from "react";
import axios from "axios";

export const useAuth = () => {
  // read from storage _once_, on initialization
  const storedUser  = localStorage.getItem("user")  || sessionStorage.getItem("user");
  const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [user, setUser]               = useState(storedUser ? JSON.parse(storedUser) : null);
  const [token, setToken]             = useState(storedToken || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!storedUser && !!storedToken);

  // whenever token changes, apply it to axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = (newToken, userData, rememberMe) => {
    const store = rememberMe ? localStorage : sessionStorage;
    store.setItem("token", newToken);
    store.setItem("user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    // axios default is set by the effect above
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, token, isAuthenticated, login, logout };
};

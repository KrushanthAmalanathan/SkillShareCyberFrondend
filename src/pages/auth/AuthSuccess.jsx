import React, { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = JSON.parse(decodeURIComponent(urlParams.get("user")));

    if (token && user) {
      login(token, user, true);
      navigate("/profile");
    } else {
      navigate("/login");
    }
  }, [navigate, login]);

  return <p>Redirecting...</p>;
};

export default AuthSuccess;

import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { UserEndPoint, AuthEndPoint,AuthAzureEndPoint } from "../../utils/ApiRequest";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${UserEndPoint}/login`, {
        email,
        password,
      });
      const { token, user } = response.data;

      login(token, user, rememberMe);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${AuthEndPoint}/google`;
  };

  const handleAzureLogin = () => {
    window.location.href = `${AuthAzureEndPoint}/azure`;
  };

  

  return (
    <div
      className="w-screen h-screen flex flex-col"
      style={{
        backgroundImage: "url('/backrd4.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="h-screen flex items-center justify-center">
        <div className="w-[400px] p-5 rounded-lg bg-white shadow-md font-sans">
          <div className="flex justify-center mb-5">
            <img src="/logo.png" alt="Logo" className="w-[200px] h-auto" />
          </div>
          <div className="flex justify-between mb-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center w-full p-2 rounded-lg border border-gray-300 bg-white text-black cursor-pointer shadow-sm"
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              <span className="text-xs">Login with Google</span>
            </button>
          </div>
          <p className="text-center text-gray-600 mb-4">OR</p>

          {/* Updated Email Input */}
          <div className="mb-4 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaEnvelope />
            </div>
            <input
              id="email"
              name="email"
              autoComplete="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Updated Password Input */}
          <div className="mb-4 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaLock />
            </div>
            <input
              id="password"
              name="password"
              autoComplete="current-password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="mr-1"
            />
            <label htmlFor="rememberMe" className="text-xs">
              Remember me
            </label>
            
          </div>

          {error && <p className="text-red-500 mb-3 text-xs">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full p-2 bg-blue-500 text-white rounded cursor-pointer"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center mt-3 text-xs">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

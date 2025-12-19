// src/components/Dashboard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  FaHome,
  FaShoppingCart,
  FaInfoCircle,
  FaUserPlus,
  FaHistory,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

const NAV_CONFIG = [
  {
    key: "home",
    to: "/",
    label: "Home",
    Icon: FaHome,
    roles: ["SuperAdmin", "Admin", "Viewer", "Lecture"],
  },
  {
    key: "courses",
    to: "/courses",
    label: "Courses",
    Icon: FaShoppingCart,
    roles: ["SuperAdmin", "Admin", "Viewer", "Lecture"],
  },
  {
    key: "userMgmt",
    to: "/profileRoleIndex",
    label: "Account Upgrade",
    Icon: FaUserPlus,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    key: "owner",
    to: "/ownCourse",
    label: "Course Owner",
    Icon: FaChalkboardTeacher,
    roles: ["SuperAdmin", "Admin", "Lecture"],
  },
  {
    key: "about",
    to: "/about",
    label: "About Us",
    Icon: FaInfoCircle,
    roles: ["SuperAdmin", "Admin", "Viewer", "Lecture"],
  },
];

const Dashboard = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fallback to "Viewer" if not logged in or role missing
  const role = (user?.role || "Viewer").trim();

  const allowedNav = NAV_CONFIG.filter((item) => item.roles.includes(role));

  const linkCls = (collapsed) =>
    `p-3 bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-300 flex items-center gap-4 rounded-lg ${
      collapsed ? "justify-center" : "justify-start"
    }`;

  return (
    <div className="min-h-screen w-full">
      {/* Header (Fixed Top) */}
      <header className="fixed top-0 left-0 right-0 h-24 bg-[#001439] text-white px-10 text-3xl font-bold flex justify-between items-center shadow-md z-50">
        <Link to="/">
          <img
            src="/logo.png"
            alt="Logo"
            className={`${
              isCollapsed ? "w-[70%]" : "w-[50%]"
            } h-auto mx-auto rounded-full transition-all duration-300 -ml-4`}
          />
        </Link>
        <h4 className="text-left"></h4>
        <Link to="/">
          <img
            src="/Logo Circle.png"
            alt="Logo"
            className="w-[85%] h-auto mx-auto rounded-full -ml-4"
          />
        </Link>
      </header>

      {/* Layout body */}
      <div className="flex pt-24">
        {/* Sidebar (Fixed Left) */}
        <aside
          className={`fixed top-24 left-0 bottom-0 bg-[#001439] text-white p-5 flex flex-col justify-between shadow-lg transition-all duration-300 z-40 ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white mb-4 self-center"
          >
            {isCollapsed ? (
              <FiChevronsRight className="w-6 h-6" />
            ) : (
              <FiChevronsLeft className="w-6 h-6" />
            )}
          </button>

          {/* Navigation (role-based) */}
          <nav className="flex flex-col gap-3">
            {allowedNav.map(({ key, to, label, Icon }) => (
              <Link key={key} to={to} className={linkCls(isCollapsed)}>
                <Icon className="w-6 h-6" />
                {!isCollapsed && <span>{label}</span>}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div
            className={`flex items-center p-3 gap-4 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="shrink-0">
              {isAuthenticated ? (
                <Link to="/profile">
                  <img
                    src={user?.profilePicture || "/default-profile.png"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                </Link>
              ) : (
                <Link to="/login">
                  <img
                    src="/default-profile.png"
                    alt="Login"
                    className="w-8 h-8 rounded-full"
                  />
                </Link>
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user?.role || "Viewer"}</p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || "guest"}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main content area */}
        <main
          className={`transition-all duration-300 p-6 bg-gray-100 min-h-[calc(100vh-6rem)] overflow-y-auto w-full ${
            isCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

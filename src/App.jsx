/**
 * Product Info Hub Frontend — App.jsx
 *
 * Main React app component. Defines all routes for the application.
 *
 * Route Map:
 *   - / (Home)
 *   - /about, /access-denied, /admin/backup
 *   - /login, /register, /profile, /profileIndex, /profile/edit, /auth-success, /profile/add, /auth/azure/callback
 *   - /templates/:id, /templates/:id/edit, /templates/:id/add-product
 *   - /products, /products/:templateID
 *   - /viewData/:id, /inspectData/:id, /editProduct/:id
 *   - /logFile
 *   - /backup, /backup/:id
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useLocation } from 'react-router-dom';
import { logActivity } from "./utils/logActivity";
import { useAuth } from './hooks/useAuth.js';

// Common
import Home from './pages/Home.jsx';
import AboutUs from './pages/common/AboutUs.jsx';
import AccessDenied from './pages/common/AccessDenied.jsx';

// Auth
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Profile from './pages/auth/Profile.jsx';
import IndexProfile from './pages/auth/IndexProfile.jsx';
import IndexRoleProfile from './pages/auth/IndexRoleProfile.jsx';
import EditProfile from './pages/auth/EditProfile.jsx';
import AuthSuccess from './pages/auth/AuthSuccess.jsx';
import AddUser from './pages/auth/AddUser.jsx';
import AuthCallback from './pages/auth/AuthCallback.jsx';

// Course
import OwnCourse from './pages/course/OwnCourse.jsx';
import CreateCourse from './pages/course/CreateCourse.jsx';
import AllCourse from './pages/course/AllCourse.jsx';
import ViewCourse from './pages/course/ViewCourse.jsx';
import CourseExam from './pages/course/CourseExam.jsx';
import EditCourse from './pages/course/EditCourse.jsx';

// Question
import EditQuestion from './pages/course/EditQuestion.jsx';
import ViewQuestion from './pages/course/ViewQuestion.jsx';

// Log file
import LogViewer from './pages/logFile/LogViewer.jsx';

// Backup


function App() {
  return (
    <Routes>
      {/* Public */}
      {/* Common Routes */}
      <Route path="/" element={<Home />} />
      {/* <Route path="/" element={<ProtectedRoute> <Home /> </ProtectedRoute>} /> */}
      <Route path="/about" element={<AboutUs/>} />
      <Route path="/access-denied" element={<AccessDenied />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      {/* <Route path="/profile" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} /> */}
      <Route path="/profileIndex" element={<IndexProfile />} />
      {/* <Route path="/profileIndex" element={<ProtectedRoute roles={['SuperAdmin']} > <IndexProfile /> </ProtectedRoute>} /> */}
      <Route path="/profileRoleIndex" element={<IndexRoleProfile />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/profile/add" element={<AddUser />} />
      <Route path="/auth/azure/callback" element={<AuthCallback />} />

      {/* Course Routes */}
      <Route path="/ownCourse" element={<OwnCourse />} /> 
      <Route path="/courses/create" element={<CreateCourse />} />
      <Route path="/courses" element={<AllCourse />} />
      <Route path="/courses/:id" element={<ViewCourse />} />
      <Route path="/courses/:id/exam" element={<CourseExam />} />
      <Route path="/courses/:id/edit" element={<EditCourse />} />

      {/* Question Routes */}
      <Route path="/courses/:id/questions" element={<ViewQuestion />} />
      <Route path="/courses/:id/questions/edit" element={<EditQuestion />} />

      {/* Log File Routes */}
      <Route path="/logFile" element={<LogViewer />} />

    </Routes>
  );
}

export default App;
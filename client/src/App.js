//This program defines the main React application shell, routing, and shared layout for all roles.

import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import ProfessorDashboard from './components/ProfessorDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  //Check if current route should show navigation.
  const showNavigation = ['/login', '/signup', '/'].includes(location.pathname);

  useEffect(() => {
    //Check for saved dark mode preference.
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);

    //Apply dark mode class to document.
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="App min-h-screen">
      {showNavigation && (
        <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      )}
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/professor" element={<ProfessorDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        <Route path="/student" element={<StudentDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute allow={["administrator"]} element={<AdminDashboard />} />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App;

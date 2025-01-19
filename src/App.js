import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import PrincipalDashboard from './components/PrincipalDashboard';
import StudentDashboard from './components/StudentDashboard';
import SeatingManagement from './components/principalcomponents/SeatingManagement';
import ScoreManagement from './components/principalcomponents/ScoreManagement';

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/principal" element={<PrincipalDashboard />} />
        <Route path="/principal/seating-management" element={<SeatingManagement />} />
        <Route path="/principal/score-management" element={<ScoreManagement />} />
      </Routes>
    </Router>
  );
};

export default App;
// AppRoutes.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import UserMaster from './UserMaster';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/user-master" element={<UserMaster onSaveUser={() => {}} />} />
    </Routes>
  </Router>
);

export default AppRoutes;

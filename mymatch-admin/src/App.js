import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';

import LoginPage from './pages/LoginPage/LoginPage';
import MaterialPage from './pages/MaterialPage/MaterialPage';
import ReviewPage from './pages/ReviewPage/ReviewPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import SettingPage from './pages/SettingPage/SettingPage';
import { UserPage } from './pages/UserPage/UserPage';
import CoursePage from './pages/CoursePage/CoursePage';
import ReviewCriterialPage from './pages/ReviewCriterialPage/ReviewCriterialPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/" element={<MaterialPage />} />
            <Route path="/materials" element={<MaterialPage />} />
            <Route path="/reviews" element={<ReviewPage />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/settings" element={<SettingPage />} />
            <Route path="/courses" element={<CoursePage />} />
            <Route path="/review-criterias" element={<ReviewCriterialPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

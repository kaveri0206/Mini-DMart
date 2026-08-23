import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import HomePage from '../pages/HomePage';
import CustomerDashboard from '../pages/CustomerDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import CheckoutPage from '../pages/CheckoutPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalog" element={<HomePage />} />
      <Route path="/dashboard" element={<CustomerDashboard />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/staff-dashboard" element={<StaffDashboard />} />
      <Route path="/admin-hub" element={<AdminDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRoutes;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import EngineerDashboard from './pages/EngineerDashboard/EngineerDashboard';
import RepterDashboard from './pages/Repoter/RepterDashboard'; // 👈 সঠিক ফাইল পাথ এবং ডিফল্ট ইম্পোর্ট

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/checker" element={<RepterDashboard />} /> {/* 👈 এখানে কম্পোনেন্টের নাম ঠিক করা হলো */}
      <Route path="/engineer" element={<EngineerDashboard />} />
    </Routes>
  );
};

export default App;
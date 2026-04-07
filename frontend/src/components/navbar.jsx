import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, User } from 'lucide-react'; 
import logo from "../assets/apple-touch-icon.png";

const Navbar = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 px-6 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img src={logo} alt="E-Auditor Logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-blue-900 hidden sm:block">
            E-Auditor
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{userRole}</span>
            <span className="text-sm font-medium text-gray-400">{userEmail}</span>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all">
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
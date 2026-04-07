import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/apple-touch-icon.png";
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();

  useEffect(()=>{
    document.title = "Authentication | Expense Auditor";
  },[])

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (isSignup) formData.append("role", role);

    try {
      const endpoint = isSignup ? "/signin" : "/login";
      const res = await axios.post(`http://localhost:8000${endpoint}`, formData);
      
      if (!isSignup) {
        // Store user info in LocalStorage so the app "remembers" them
        localStorage.setItem("userRole", res.data.role);
        localStorage.setItem("userEmail", res.data.email);
        
        navigate(res.data.role === "auditor" ? "/admin" : "/upload");
      } else {
        toast.success("Account created successfully! Please log in.",{
          style: {
            border: '1px solid #10b981',
            padding: '16px',
            color: '#064e3b',
            borderRadius: '12px',
            fontWeight: 'bold',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#FFFAEE',
          },
        });
        setIsSignup(false);
      }
    } catch (err) {
      toast.error("Something went wrong",{
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#7f1d1d',
          borderRadius: '12px',
          fontWeight: 'bold',
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <img src={logo} alt="E-Auditor Logo" className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-blue-900">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-500 mt-2">
            {isSignup ? "Join E-Auditor to track expenses" : "Sign in to manage your claims"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              placeholder="name@company.com" 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          {/* Password Field (Added this since your handleSubmit uses it) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input 
              type="password" 
              required 
              className="w-full mt-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              placeholder="••••••••" 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          {/* Role Selection - ONLY visible during Signup */}
          {isSignup && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700">Account Role</label>
              <select 
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="employee">Employee (Submitter)</option>
                <option value="auditor">Finance Auditor (Reviewer)</option>
              </select>
            </div>
          )}

          {/* Action Button */}
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            {isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle between Login/Signup */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            {isSignup ? "Already have an account?" : "New to E-Auditor?"}
            <button 
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="ml-2 text-blue-600 font-bold hover:underline"
            >
              {isSignup ? "Log In" : "Create an Account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
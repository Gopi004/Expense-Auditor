import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, we'd verify password here. 
    // For the hackathon, we just route based on selection.
    if (role === "auditor") {
      navigate("/admin");
    } else {
      navigate("/upload");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-900">E-Auditor</h2>
          <p className="text-gray-500 mt-2">Sign in to manage expenses</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" required className="w-full mt-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="name@company.com" onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Role</label>
            <select className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">Employee (Submitter)</option>
              <option value="auditor">Finance Auditor (Reviewer)</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
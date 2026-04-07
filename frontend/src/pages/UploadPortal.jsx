import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const UploadPortal = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Submit Receipt | Expense Auditor";
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    // If no role exists, they haven't logged in
    if (!role) {
      navigate("/");
    }
  }, [navigate]);

  const [file, setFile] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [pastClaims, setPastClaims] = useState([]);

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a receipt",{
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#7f1d1d',
          borderRadius: '12px',
          fontWeight: 'bold',
        }
      });

    setLoading(true);
    setTimeout(() => setStatusMessage("Uploading receipt..."), 0);
    setTimeout(() => setStatusMessage("Scanning receipt..."), 1000);
    setTimeout(() => setStatusMessage("Extracting data..."), 3000);
    setTimeout(() => setStatusMessage("Checking against corporate policy..."), 5000);
    // ... after Gemini responds ...
    setTimeout(() => setStatusMessage("Finalizing audit results..."), 7000);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", purpose);
    formData.append("email", localStorage.getItem("userEmail"));

    try {
      const response = await axios.post(`${API_BASE_URL}/audit`, formData);
      setResult(response.data.analysis);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
      fetchMyClaims();
    }
  };

  const fetchMyClaims = async () => {
    const email = localStorage.getItem("userEmail");
    try {
      const res = await axios.get(`${API_BASE_URL}/my-claims?email=${email}`);
      setPastClaims(res.data.claims);
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  useEffect(() => {
    fetchMyClaims();
  }, []);

  useEffect(() => {
    if (result) {
      window.scrollTo({ 
        top: document.body.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="pt-20 min-h-screen bg-gray-50 p-8 font-sans">
        <div className="max-w-3xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-blue-900">AI Expense Auditor</h1>
            <p className="text-gray-600">Submit your receipt for instant policy compliance check</p>
          </header>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
                <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
                  <p className='text-[12px] px-3 py-2 text-gray-500'>Max size: 5MB</p>
              </div>

              {/* Purpose Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Purpose</label>
                <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Client dinner at Starbucks"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24"/>
              </div>

              <button onClick={handleUpload} disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {loading ? statusMessage : "Submit for Audit"}
              </button>
            </div>
          </div>

          {/* Result Card */}
          {result && (
            <div className="mt-8 animate-fade-in">
              <div className={`p-6 rounded-xl border-l-8 shadow-md ${
                result.status === "Approved" ? "bg-green-50 border-green-500" : 
                result.status === "Flagged" ? "bg-yellow-50 border-yellow-500" : "bg-red-50 border-red-500"
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{result.merchant}</h3>
                    <p className="text-sm text-gray-500">{result.date}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase ${
                    result.status === "Approved" ? "bg-green-200 text-green-800" : 
                    result.status === "Flagged" ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"
                  }`}>
                    {result.status}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Amount</p>
                    <p className="text-lg font-mono font-bold text-gray-700">{result.currency} {result.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Reasoning</p>
                    <p className="text-sm text-gray-600 italic">"{result.reason}"</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Recent Submissions</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3 text-left">Merchant</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pastClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{c.merchant}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.currency} {c.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          c.status === "Approved" ? "bg-green-100 text-green-700" : 
                          c.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">{c.date || "Recently"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pastClaims.length === 0 && (
                <p className="p-10 text-center text-gray-400">No previous claims found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UploadPortal;
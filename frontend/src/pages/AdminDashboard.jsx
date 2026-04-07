import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import { Check, X } from "lucide-react";
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(()=> {
    document.title = "Admin Dashboard | Expense Auditor";
  },[])

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    
    // If not logged in OR if they are just an employee, kick them out
    if (!role || role !== "auditor") {
      toast.error("Auditors Only!", { icon: '🚫' },{
        style: {
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#7f1d1d',
          borderRadius: '12px',
          fontWeight: 'bold',
        }
      });
      navigate("/");
    }
  }, [navigate]);

  const [claims, setClaims] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(null); // Stores the claim ID
  const [tempReason, setTempReason] = useState("");

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/all-claims`, {
          headers: { "x-user-role": "auditor" }
        });
        setClaims(res.data.claims);
      } catch (err) {
        toast.error("Access denied or Server error",{
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
    fetchClaims();
  }, []);

  const handleStatusUpdate = async (id, newStatus, manualReason) => {
    const formData = new FormData();
    formData.append("status", newStatus);
    formData.append("reason", manualReason);

    try {
      await axios.patch(`${API_BASE_URL}/admin/update-status/${id}`, formData);
      
      // Refresh the data locally so the UI updates immediately
      setClaims(prevClaims => 
        prevClaims.map(c => c.id === id ? { ...c, status: newStatus, reason: `Manual: ${manualReason}` } : c)
      );
      
      toast.success(`Claim ${id} is now ${newStatus}`,{
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
    } catch (err) {
      toast.error("Failed to update status",{
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
        <div className="pt-20 min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Finance Review Queue</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">

            {claims.length === 0 ? (
                <div className="bg-white shadow-sm border-gray-200 p-20 text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-gray-700">All caught up!</h3>
                  <p className="text-gray-400 mt-2">There are no pending expense claims to audit right now.</p>
                </div>
              ) : (
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Merchant</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b border-gray-200">
                      <td className="px-5 py-5 text-sm font-medium">{claim.merchant}</td>
                      <td className="px-5 py-5 w-30 align-middle text-sm">
                        {claim.currency} {Number(claim.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-5 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          claim.status === "Approved" ? "bg-green-100 text-green-700" : 
                          claim.status === "Rejected" ? "bg-red-100 text-red-700" : 
                          "bg-yellow-100 text-yellow-700 animate-pulse"
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-sm text-gray-600 italic whitespace-normal wrap-break-word min-w-30" title={claim.reason}>
                        {claim.reason}
                      </td>

                      <td className="px-5 py-5 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleStatusUpdate(claim.id, "Approved", "Manual approval by Auditor")}
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-sm border border-green-100"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setShowRejectModal(claim.id);
                              setTempReason("");            
                            }}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96 animate-in fade-in zoom-in duration-200">
              <h3 className="text-lg font-bold mb-4">Reject Claim {showRejectModal}</h3>
              <textarea 
                className="w-full p-3 border rounded-lg mb-4 h-24 outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Why is this being rejected?"
                onChange={(e) => setTempReason(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowRejectModal(null)} className="px-4 py-2 text-gray-500">Cancel</button>
                <button 
                  onClick={() => {
                    handleStatusUpdate(showRejectModal, "Rejected", tempReason || "Policy Violation");
                    setShowRejectModal(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
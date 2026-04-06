import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  useEffect(()=> {
    document.title = "Admin Dashboard | Expense Auditor";
  },[])

  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await axios.get("http://localhost:8000/admin/all-claims", {
          headers: { "x-user-role": "auditor" }
        });
        setClaims(res.data.claims);
      } catch (err) {
        alert("Access Denied or Server Error");
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
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
                </tr>
              </thead>
              
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id} className="border-b border-gray-200">
                    <td className="px-5 py-5 text-sm font-medium">{claim.merchant}</td>
                    <td className="px-5 py-5 w-30 align-middle text-sm">{claim.currency} {Number(claim.amount || 0).toFixed(2)}</td>
                    <td className="px-5 py-5 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        claim.status === "Approved" ? "bg-green-100 text-green-700" : claim.status==="Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}>{claim.status}</span>
                    </td>
                    <td className="px-5 py-5 text-sm text-gray-600 italic">{claim.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
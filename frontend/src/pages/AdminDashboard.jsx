import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
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
                  <td className="px-5 py-5 text-sm">${claim.amount}</td>
                  <td className="px-5 py-5 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      claim.status === "Approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>{claim.status}</span>
                  </td>
                  <td className="px-5 py-5 text-sm text-gray-600 italic">{claim.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
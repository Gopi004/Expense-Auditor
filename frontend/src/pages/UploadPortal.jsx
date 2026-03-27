import React, { useState } from 'react';
import axios from 'axios';

const UploadPortal = () => {
  const [file, setFile] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a receipt");
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", purpose);

    try {
      const response = await axios.post("http://localhost:8000/audit", formData);
      setResult(response.data.analysis);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
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
              <input type="file" onChange={(e) => setFile(e.target.files[0])} 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
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
              {loading ? "Analyzing Receipt..." : "Submit for Audit"}
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
      </div>
    </div>
  );
};

export default UploadPortal;
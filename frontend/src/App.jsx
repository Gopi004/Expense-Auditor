import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", purpose);

    try {
      const response = await axios.post("http://localhost:8000/audit", formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error uploading:", error);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Expense Auditor</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <input 
        type="text" 
        placeholder="Business Purpose (e.g. Client Dinner)" 
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        style={{ width: '300px', padding: '10px' }}
      />
      <br /><br />
      <button onClick={handleUpload} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Submit for Audit
      </button>

      {result && (
        <div style={{ marginTop: '20px', color: 'green' }}>
          <h3>Server Response:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
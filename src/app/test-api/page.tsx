'use client';

import { useState, useEffect } from 'react';

export default function TestAPI() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testAPI() {
      try {
        console.log('Testing API...');
        const response = await fetch('https://cryptocolosseum-backend.onrender.com/api/wars/active');
        console.log('Response:', response);
        const data = await response.json();
        console.log('Data:', data);
        setData(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      }
    }
    
    testAPI();
  }, []);

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl mb-4">API Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-lg mb-2">Testing: https://cryptocolosseum-backend.onrender.com/api/wars/active</h2>
      </div>
      
      {error && (
        <div className="bg-red-900 p-4 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="bg-green-900 p-4 rounded">
          <strong>Success! Data received:</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      {!data && !error && (
        <div className="bg-blue-900 p-4 rounded">
          Loading...
        </div>
      )}
    </div>
  );
}
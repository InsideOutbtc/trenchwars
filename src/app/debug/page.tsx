'use client';

export default function Debug() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl mb-4">Debug API Configuration</h1>
      
      <div className="space-y-4">
        <div>
          <strong>NEXT_PUBLIC_API_URL:</strong> {apiUrl || 'undefined'}
        </div>
        
        <div>
          <strong>Expected:</strong> https://cryptocolosseum-backend.onrender.com/api
        </div>
        
        <div>
          <strong>Current URL being called:</strong> 
          <span className="text-red-400"> https://api.cryptocolosseum.app/api/wars/active</span>
        </div>
        
        <div className="mt-8">
          <button 
            onClick={() => {
              console.log('Environment variables:');
              console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
              console.log('All NEXT_PUBLIC vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));
            }}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Log Environment Variables
          </button>
        </div>
        
        <div className="mt-4">
          <button
            onClick={async () => {
              try {
                console.log('Testing direct fetch...');
                const response = await fetch('https://cryptocolosseum-backend.onrender.com/api/wars/active');
                const data = await response.json();
                console.log('Direct fetch success:', data);
                alert('Direct fetch worked! Check console for data.');
              } catch (error) {
                console.error('Direct fetch failed:', error);
                alert('Direct fetch failed: ' + error.message);
              }
            }}
            className="bg-green-600 px-4 py-2 rounded ml-2"
          >
            Test Direct Fetch
          </button>
        </div>
      </div>
    </div>
  );
}
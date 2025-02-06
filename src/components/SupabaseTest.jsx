import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Checking...');

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase.from('products').select('count');
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('Connection failed: ' + error.message);
          return;
        }
        
        setConnectionStatus('Connected successfully to Supabase!');
        console.log('Connection test data:', data);
      } catch (err) {
        console.error('Test failed:', err);
        setConnectionStatus('Connection test failed: ' + err.message);
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="p-4 m-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Test</h2>
      <p className={`${
        connectionStatus.includes('successfully') 
          ? 'text-green-600' 
          : 'text-red-600'
      }`}>
        {connectionStatus}
      </p>
    </div>
  );
};

export default SupabaseTest; 
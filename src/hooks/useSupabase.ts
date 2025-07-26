import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async (queryFn: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      setLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  return { loading, error, executeQuery };
};

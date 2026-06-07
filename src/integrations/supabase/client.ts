import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Fail-fast in development if env vars are missing
if (import.meta.env.DEV && (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY)) {
  console.warn("E-VARA: Missing Environment Variables. Falling back to local development mocks.");
}

// Strictly use local mock if URL is missing to avoid "Shadow Infrastructure" risks
export const supabase = createClient<Database>(
  SUPABASE_URL || "http://127.0.0.1:54321", // Standard local Supabase CLI URL
  SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.local-mock"
);

/**
 * Health check to verify if the infrastructure is reachable.
 */
export const checkInfrastructure = async (): Promise<boolean> => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return false;
  try {
    const { error } = await supabase.from('monitored_identities' as any).select('count', { count: 'exact', head: true }).limit(1);
    return !error;
  } catch {
    return false;
  }
};

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

// Comprehensive logging function
const logEnvironmentConfig = () => {
  console.group('Supabase Environment Configuration');
  console.log('Supabase URL:', supabaseUrl ? 'Configured ' : 'Missing ');
  console.log('Supabase Anon Key:', supabaseAnonKey ? 'Configured ' : 'Missing ');
  console.log('Supabase Service Role Key:', supabaseServiceRoleKey ? 'Configured ' : 'Missing ');
  console.groupEnd();
};

// Validate keys
if (!supabaseUrl) {
  console.error('Missing REACT_APP_SUPABASE_URL environment variable');
  logEnvironmentConfig();
  throw new Error('Missing REACT_APP_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('Missing REACT_APP_SUPABASE_ANON_KEY environment variable');
  logEnvironmentConfig();
  throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY environment variable');
}

// Singleton pattern to prevent multiple client instances
let supabaseInstance = null;
let supabaseAdminInstance = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log('Supabase client created successfully');
    } catch (error) {
      console.error('Error creating Supabase client:', error);
      logEnvironmentConfig();
      throw error;
    }
  }
  return supabaseInstance;
})();

// Admin client for operations requiring service role
export const supabaseAdmin = (() => {
  // Log service role key configuration
  if (!supabaseServiceRoleKey) {
    console.warn('Missing REACT_APP_SUPABASE_SERVICE_ROLE_KEY. Admin operations will be limited.');
    logEnvironmentConfig();
    return null;
  }

  if (!supabaseAdminInstance) {
    try {
      supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log('Supabase admin client created successfully');
    } catch (error) {
      console.error('Error creating Supabase admin client:', error);
      logEnvironmentConfig();
      return null;
    }
  }
  return supabaseAdminInstance;
})();

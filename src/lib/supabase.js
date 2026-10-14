import { createClient } from '@supabase/supabase-js';

// Live Clipboard's Supabase project. The publishable key is meant to be public;
// access is controlled by the RLS policies in supabase/schema.sql.
const SUPABASE_URL = 'https://pldbofrdwqmgmoxvogjq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_WUrRqVl4yOPXvSegrkYv7g_YNit5VIU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

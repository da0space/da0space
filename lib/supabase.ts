import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mcxjgnufromujyvxdrau.supabase.co';
const supabaseAnonKey = 'sb_publishable_r7KIAbYOzE1UyrOdxyIsew_Y9vp3kxY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

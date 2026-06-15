import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rjrkdperxqtgdsuasefn.supabase.co';
const supabaseKey = 'sb_publishable_6WRYJQko4l-1xlnMuCRV6A_Y9co8shK';

export const supabase = createClient(supabaseUrl, supabaseKey);
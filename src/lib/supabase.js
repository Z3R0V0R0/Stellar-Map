import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pppctkcakplytxaixnpo.supabase.co";
const supabaseKey = "sb_publishable_pZye7lSfee9u1Iclhpd4Yw_vSpffXcR";

export const supabase = createClient(supabaseUrl, supabaseKey);
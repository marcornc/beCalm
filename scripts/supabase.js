
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://rwharymszlgtaxvpvotb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3aGFyeW1zemxndGF4dnB2b3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU3NDQ4MjAsImV4cCI6MjAyMTMyMDgyMH0.g1pQub4PeODpSFsD2WNZxCtQ2we323WeBGEQTwoM27I";


export const supabase = createClient(supabaseUrl, supabaseKey);
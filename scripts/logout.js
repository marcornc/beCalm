import { supabase } from "./supabase.js";

const {
  data: { user },
} = await supabase.auth.getUser();
if (user) {
  const { error } = await supabase.auth.signOut();
}

export async function resetdb(supabase, user) {
  const { data: deleteUserDetailsdata, error: deleteUserDetailsError } = await supabase.from("user_details").delete().match({ user_id: user.id });
  if (deleteUserDetailsError) throw new Error(`Error deleting user details in resetdb: ${deleteUserDetailsError}`);
  const { error: insertUserDetailsError } = await supabase.from("user_details").insert({ user_id: user.id });
  if (insertUserDetailsError) throw new Error(`Error inserting user details in resetdb: ${insertUserDetailsError}`);
  const { data: deleteUserProgressdata, error: deleteUserProgressError } = await supabase.from("user_progress").delete().match({ user_id: user.id });
  if (deleteUserProgressError) throw new Error(`Error deleting user progress in resetdb: ${deleteUserProgressError}`);
}

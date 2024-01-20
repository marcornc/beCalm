import { supabase } from "./supabase.js";
import { nextPage} from "./nextPage.js";

// is user logged in?  If not, redirect to login page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "./login.html";
}

// set constants for html elements
const continueButton = document.querySelector(".continue");
const checkbox = document.querySelector(".checkbox");
const errorMessage = document.querySelector(".error");

// add event listener for continue button
continueButton.addEventListener("click", next);

// if continue button clicked, check if checkbox is ticked
// if it is update the database to not show it again
async function next() {
  if (!checkbox.checked) {
    window.location.href = await nextPage(supabase, user, "disclaimer");
    return;
  }

  try {
    // Perform the update
    const { error } = await supabase.from("user_details").update({ suppress_disclaimer: true }).eq("user_id", user.id);

    if (error) {
      throw new Error(`Error updating record in suppress disclaimer: ${error.message}`);
    }
    window.location.href = await nextPage(supabase, user, "disclaimer");
  } catch (error) {
    console.error(error.message);
  }
}

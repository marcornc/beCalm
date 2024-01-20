import { supabase } from "./supabase.js";
import { nextPage } from "./nextPage.js";

// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "./login.html";
}

const checkbox = document.querySelector(".checkbox");
const continueButton = document.querySelector(".continue");

continueButton.addEventListener("click", async () => {
  await next();
});

// if continue button clicked, check if checkbox is ticked
// if it is update the database to not show it again
async function next() {
  if (!checkbox.checked) {
    const nextPageAddress = (window.location.href = await nextPage(supabase, user, "usage"));
    return;
  }

  try {
    // Perform the update
    const { error } = await supabase.from("user_details").update({ usage_due: false }).eq("user_id", user.id);

    if (error) {
      throw new Error(`Error updating record in usage: ${error.message}`);
    }
    window.location.href = await nextPage(supabase, user, "usage");
  } catch (error) {
    console.error(error.message);
  }
}

import { supabase } from "./supabase.js";

// check if user is already logged in - if they are redirect to disclaimer page
const {
  data: { user },
} = await supabase.auth.getUser();

// set constants for html elements
const emailInput = document.querySelector("#reset-email");
const errorMessage = document.querySelector(".error");
const successMessage = document.querySelector(".success");

// Function to handle login form submission
document.querySelector(".reset-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  // get email input elements
  const email = emailInput.value;

  if (!email) {
    successMessage.classList.add("hidden");
    errorMessage.textContent = `Email must be entered`;
    errorMessage.classList.remove("hidden");
    return;
  }

  try {
    // attempt password reset
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://becalm-final-project.onrender.com/pages/newPassword.html",
    });

    // if reset was unsuccessful, hide success message and show error message
    if (error) {
      successMessage.classList.add("hidden");
      errorMessage.textContent += ` - ${error.message}`;
      errorMessage.classList.remove("hidden");
      // if login was successful, show success message, hide error message and redirect to disclaimer page
    } else {
      successMessage.classList.remove("hidden");
      errorMessage.classList.add("hidden");
      emailInput.value = "";
    }
    // unexpected error
  } catch (error) {
    console.error("Unexpected error during login:", error.message);
  }
});

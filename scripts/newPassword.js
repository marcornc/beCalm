import { supabase } from "./supabase.js";

// check if user is already logged in - if they are not, redirect to login page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "./login.html";
}

// set constants for html elements
const passwordInput = document.querySelector("#reset-password");
const passwordInputConfirm = document.querySelector("#reset-password-confirm");
const errorMessage = document.querySelector(".error");
const successMessage = document.querySelector(".success");

// Function to handle register form submission
document.querySelector(".newPassword-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  // get email and both passwords from input elements
  const password = passwordInput.value;
  const passwordConfirm = passwordInputConfirm.value;

  // initial validation - do passwords match, if not show error message
  if (password !== passwordConfirm) {
    successMessage.classList.add("hidden");
    errorMessage.textContent = `Passwords must match`;
    errorMessage.classList.remove("hidden");
    return;
  }

  // initial validation - were both passwords entered, if not show error message
  if (!password || !passwordConfirm) {
    successMessage.classList.add("hidden");
    errorMessage.textContent = `Both passwords must be entered`;
    errorMessage.classList.remove("hidden");
    return;
  }

  try {
    // attempt user registration at supabase
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

     // if reset was successful, show success message, hide error message and clear input fields
    if (data.user) {
      successMessage.classList.remove("hidden");
      errorMessage.classList.add("hidden");

      passwordInput.value = "";
      passwordInputConfirm.value = "";
      window.location.href = "./login.html";

      // if reset was unsuccessful, hide success message and show error message
    } else if (error) {
      successMessage.classList.add("hidden");
      errorMessage.textContent = `There was a problem with the reset, ${error.message}`;
      errorMessage.classList.remove("hidden");
    }
  } catch (error) {
    // unexpected error
    console.error("Unexpected error during password reset:", error.message);
    successMessage.classList.add("hidden");
    errorMessage.textContent = `There was an unexpected problem during password reset`;
    errorMessage.classList.remove("hidden");
  }
});

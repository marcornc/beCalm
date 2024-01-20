import { supabase } from "./supabase.js";
import { nextPage} from "./nextPage.js";

// check if user is already logged in - if they are redirect to disclaimer page
const {
  data: { user },
} = await supabase.auth.getUser();

let feedbackDue = false;

if (user) {
    window.location.href = await nextPage(supabase, user, "login");
}

// set constants for html elements
const emailInput = document.querySelector("#login-email");
const passwordInput = document.querySelector("#login-password");
const errorMessage = document.querySelector(".error");
const successMessage = document.querySelector(".success");

// Function to handle login form submission
document.querySelector(".login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  // get email and password from input elements
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    // attempt login to supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    // if login was successful, show success message, hide error message and redirect to disclaimer page
    if (data.user) {
      successMessage.classList.remove("hidden");
      errorMessage.classList.add("hidden");
      window.location.href = await nextPage(supabase, data.user, "login");
      // window.location.href = "./disclaimer.html";

      // if login was unsuccessful, hide success message and show error message
    } else if (error) {
      successMessage.classList.add("hidden");
      errorMessage.textContent += ` - ${error.message}`;
      errorMessage.classList.remove("hidden");
    }
    // unexpected error
  } catch (error) {
    console.error("Unexpected error during login:", error.message);
  }
});

import { supabase } from "./supabase.js";

// check if user is already logged in - if they are redirect to disclaimer page
const {
  data: { user },
} = await supabase.auth.getUser();
// if (user) {
//   window.location.href = "./disclaimer.html";
// }

let feedbackDue = false;

if (user) {
  const { data, error } = await supabase.from("user_details").select("*").eq("user_id", user.id);

  if (error) {
    console.error("Error fetching user details:", error.message);
  } else {
    feedbackDue = data[0].feedback_due;
    if (data.length === 0) {
      console.log("No user details record in disclaimer.js - this should never happen");
    } else {
      if (data[0].suppress_disclaimer) {
        if (feedbackDue) {
          window.location.href = "./feedback.html";
        } else {
          window.location.href = "./menu.html";
        }
      } else {
        window.location.href = "./disclaimer.html";
      }
    }
  }
}

// set constants for html elements
const emailInput = document.querySelector("#register-email");
const passwordInput = document.querySelector("#register-password");
const passwordInputConfirm = document.querySelector("#register-password-confirm");
const errorMessage = document.querySelector(".error");
const successMessage = document.querySelector(".success");

// Function to handle register form submission
document.querySelector(".register-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  // get email and both passwords from input elements
  const email = emailInput.value;
  const password = passwordInput.value;
  const passwordConfirm = passwordInputConfirm.value;

  // initial validation - was email address entered, if not show error message
  if (!email) {
    successMessage.classList.add("hidden");
    errorMessage.textContent = `Email must be entered`;
    errorMessage.classList.remove("hidden");
    return;
  }

  // initial validation - do passwords match, if not show error message
  if (password !== passwordConfirm) {
    console.error("Password mismatch");
    successMessage.classList.add("hidden");
    errorMessage.textContent = `Passwords must match`;
    errorMessage.classList.remove("hidden");
    return;
  }

  // initial validation - were both passwords entered, if not show error message
  if (!password || !passwordConfirm) {
    console.error("Passwords must be entered");
    successMessage.classList.add("hidden");
    errorMessage.textContent = `Both passwords must be entered`;
    errorMessage.classList.remove("hidden");
    return;
  }

  try {
    // attempt user registration at supabase
    const { data, error } = await supabase.auth.signUp({ email, password });

    // if registration was successful, show success message, hide error message and clear input fields
    if (data.user) {
      successMessage.classList.remove("hidden");
      errorMessage.classList.add("hidden");

      emailInput.value = "";
      passwordInput.value = "";
      passwordInputConfirm.value = "";

      // if registration was unsuccessful, hide success message and show error message
    } else if (error) {
      successMessage.classList.add("hidden");
      errorMessage.textContent = `There was a problem with the registration, ${error.message}`;
      errorMessage.classList.remove("hidden");
    }
  } catch (error) {
    // unexpected error
    console.error("Unexpected error during registration:", error.message);
    successMessage.classList.add("hidden");
    errorMessage.textContent = `There was an unexpected problem during registration`;
    errorMessage.classList.remove("hidden");
  }
});

import { supabase } from "./supabase.js";
import { nextPage } from "./nextPage.js";

// check if user is already logged in - if they are redirect to disclaimer page
const {
  data: { user },
} = await supabase.auth.getUser();

const loginButton = document.querySelector(".login");
const signupButton = document.querySelector(".signup");
const continueButton = document.querySelector(".continue");

if (user) {
  document.querySelector(".login").classList.add("hidden");
  document.querySelector(".signup").classList.add("hidden");
  document.querySelector(".continue").classList.remove("hidden");
} else {
  document.querySelector(".login").classList.remove("hidden");
  document.querySelector(".signup").classList.remove("hidden");
  document.querySelector(".continue").classList.add("hidden");
}

continueButton.addEventListener("click", async () => {
  window.location.href = await nextPage(supabase, user, "index");
});

import { supabase } from "./supabase.js";
import { exerciseDone } from "./exerciseDone.js";

// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "./login.html";
}

const cbBtns = document.querySelectorAll(".main-menu");
cbBtns.forEach(button => {
  button.addEventListener("click", () => {
    window.location.href = "./menu.html";
  });
})

await exerciseDone(supabase, user);



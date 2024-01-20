import { supabase } from "./supabase.js";

// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "./login.html";
}

const program = document.querySelector(".programBtnContainer");
program.addEventListener("click", () => {
  window.location.href = "./sevenDay.html";
});

// set up event listener for calm breathing button and navigate to calm breathing page if clicked
const cb = document.querySelector(".cb");
cb.addEventListener("click", () => {
  window.location.href = "./calmBreathing.html";
});

// set up event listener for personal expression button and navigate to personal expression page if clicked
const pe = document.querySelector(".pe");
pe.addEventListener("click", () => {
  window.location.href = "./personalExpression.html";
});
// set up event listener for personal expression button and navigate to personal expression page if clicked
const bm = document.querySelector(".cm");
bm.addEventListener("click", () => {
  window.location.href = "../pages/calmMindAudios/calmMind.html";
});

// set up event listener for personal expression button and navigate to personal expression page if clicked
const gv = document.querySelector(".gv");
gv.addEventListener("click", () => {
  window.location.href = "../pages/guideVisualisation-audio/guidedVisualisation.html";
});

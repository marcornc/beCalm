import { supabase } from "./supabase.js";
import { exerciseDone } from "./exerciseDone.js";
// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "/index.html";
}

const uploadMandala = document.querySelector(".uploadMandala");
const drawMandala = document.querySelector(".drawMandala");
const viewMandalas = document.querySelector(".viewMandalas");
const menuButton = document.querySelector(".mainMenu");

uploadMandala.addEventListener("click", () => {
  window.location.href = "./personalExpression-uploadMandala.html";
});

drawMandala.addEventListener("click", () => {
  window.location.href = "./personalExpression-drawMandala.html";
});

viewMandalas.addEventListener("click", () => {
  window.location.href = "./personalExpression-viewMandalas.html";
});

menuButton.addEventListener("click", () => {
  window.location.href = "./menu.html";
});

await exerciseDone(supabase, user);

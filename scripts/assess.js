import { supabase } from "./supabase.js";
import { nextPage } from "./nextPage.js";

// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "./login.html";
}

const { data: userDetails, error } = await supabase.from("user_details").select("*").eq("user_id", user.id);

// set constants for slider html elements
const wellbeingInput = document.querySelector(".wellbeing");
const wellbeingDisplay = document.querySelector(".wellbeing-display");
const breathingInput = document.querySelector(".breathing");
const breathingDisplay = document.querySelector(".breathing-display");
const relaxInput = document.querySelector(".relax");
const relaxDisplay = document.querySelector(".relax-display");
const expressInput = document.querySelector(".express");
const expressDisplay = document.querySelector(".express-display");
const visualiseInput = document.querySelector(".visualise");
const visualiseDisplay = document.querySelector(".visualise-display");

// initialise slider displays (without this they appear incorrect if someone uses the back button to get to the page)
setSliderValue(wellbeingInput, wellbeingDisplay);
setSliderValue(breathingInput, breathingDisplay);
setSliderValue(relaxInput, relaxDisplay);
setSliderValue(expressInput, expressDisplay);
setSliderValue(visualiseInput, visualiseDisplay);

// set event listeners for sliders

wellbeingInput.addEventListener("input", () => {
  setSliderValue(wellbeingInput, wellbeingDisplay);
});

breathingInput.addEventListener("input", () => {
  setSliderValue(breathingInput, breathingDisplay);
});

relaxInput.addEventListener("input", () => {
  setSliderValue(relaxInput, relaxDisplay);
});

expressInput.addEventListener("input", () => {
  setSliderValue(expressInput, expressDisplay);
});

visualiseInput.addEventListener("input", () => {
  setSliderValue(visualiseInput, visualiseDisplay);
});

function setSliderValue(slider, display) {
  display.textContent = `Value: ${slider.value}`;
}

// set up event listener for continue and skip buttons and navigate to menu page if clicked
const continueButton = document.querySelector(".continue");
continueButton.addEventListener("click", async () => {
  // TODO - update database
  const values = {
    user_id: user.id,
    wellbeing: Number(wellbeingInput.value),
    breathing: Number(breathingInput.value),
    relax: Number(relaxInput.value),
    express: Number(expressInput.value),
    visualise: Number(visualiseInput.value),
  };
  // const { error } = await supabase.from("user_progress").insert(values);
  const { data, error } = await supabase.from("user_progress").upsert([values], { onConflict: ["user_id", "survey_date"] });
  if (error) {
    console.log(`Error inserting user progress record in feedback.js: ${error}`);
  }
  const { updateError } = await supabase.from("user_details").update({ feedback_due: false }).eq("user_id", user.id);
  if (updateError) {
    console.log(`Error updating feedback_due in user progress record on skip in feedback.js: ${updateError}`);
  }
  if (userDetails[0].program_days_spent > 1) {
    window.location.href = "/pages/menu.html";
  } else {
    window.location.href = await nextPage(supabase, user, "assess");
  }
});

const skipButton = document.querySelector(".skip");
skipButton.addEventListener("click", async () => {
  const { data: updatedRecords, error } = await supabase.from("user_details").update({ feedback_due: false }).eq("user_id", user.id);
  if (error) {
    console.log("Error updating feedback_due in user progress record on skip in feedback.js");
  }
  if (userDetails[0].program_days_spent > 1) {
    window.location.href = "/pages/menu.html";
  } else {
    window.location.href = await nextPage(supabase, user, "assess");
  }
});

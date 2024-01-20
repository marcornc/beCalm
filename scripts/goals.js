import { supabase } from "./supabase.js";
import { nextPage } from "./nextPage.js";

// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "./login.html";
}

// set constants for html elements
const errorElem = document.querySelector(".error");
const goalImages = document.querySelectorAll(".goal-image");
const continueButton = document.querySelector(".continue");
const skipButton = document.querySelector(".skip");
const userAvatar = document.querySelector(".user-avatar");

// equalise the buttons when the screen is resized
window.addEventListener("resize", () => {
  const goals = document.querySelectorAll(".goal");
  equaliseButtons(goals);
});

// handle click on a goal button
function goalClick(event) {
  const button = event.target;
  errorElem.classList.add("hidden");
  document.querySelectorAll(".goal").forEach((button) => {
    button.classList.remove("selected");
  });
  button.classList.add("selected");
  if (button.dataset.custom === "true") {
    const inputField = button.firstElementChild;
    inputField.classList.remove("hidden");
    inputField.focus();
  }
}

// handle exit from personal goal input
function changeInput(event) {
  event.stopPropagation();
  const inputField = event.target;

  const button = inputField.parentElement;
  const newValue = inputField.value === "" ? "My own goal" : inputField.value;
  button.textContent = newValue;
  // need to rebuild the child input element as updating textContent deletes the child
  createButtonChildInput(button);
  const newInputField = button.firstElementChild;
  newInputField.value = button.textContent;
  newInputField.classList.add("hidden");
}

const goalContainer = document.querySelector(".goal-container");

// equalise button heights (isn't quite working) and set border radius for rounded ends
function equaliseButtons(buttons) {
  // Calculate the maximum height among all buttons
  let maxHeight = 0;
  buttons.forEach((button) => {
    maxHeight = Math.max(maxHeight, button.clientHeight);
  });

  // Apply the maximum height and border radius to all buttons
  buttons.forEach((button) => {
    button.style.height = `${maxHeight + 10}px`;
    button.style.borderRadius = `${(maxHeight + 10) / 2}px`; // Set border radius to half the height
  });
}

// create a child for a goal button to allow entry of personal goal
function createButtonChildInput(button) {
  const inputField = document.createElement("input");
  inputField.id = "goalInput";
  inputField.classList.add("goalInput", "hidden");
  // inputField.addEventListener("change", changeInput);
  inputField.addEventListener("blur", changeInput);
  button.appendChild(inputField);
}

// handle click on a goal image
goalImages.forEach((image) => {
  image.addEventListener("click", function (event) {
    const image = event.target;
    document.querySelectorAll(".goal-image").forEach((image) => {
      image.classList.remove("selected");
    });
    image.classList.add("selected");
    errorElem.classList.add("hidden");
    userAvatar.src = image.getAttribute("src").replace("..","");
    userAvatar.alt = "user avatar";
    userAvatar.classList.add("personalised");
  });
});

async function updateGoalsDue() {
  const { error } = await supabase.from("user_details").update({ goals_due: false }).eq("user_id", user.id);

  if (error) {
    console.log(`Error updating record in suppress disclaimer: ${error.message}`);
  }
}

if (user) {
  try {
    // Perform the update
    const { data, error } = await supabase.from("goals").select("*").order("sequence");

    if (error) {
      throw new Error(`Error reading goals records in goals: ${error.message}`);
    }

    for (let item of data) {
      const button = document.createElement("button");
      button.textContent = item.description;
      button.classList.add("goal");
      button.style.flex = "1";
      button.setAttribute("data-row", item.id);
      button.setAttribute("data-custom", item.further_details);
      button.addEventListener("click", goalClick);
      goalContainer.appendChild(button);
      if (item.further_details) {
        createButtonChildInput(button);
      }
    }
    const goals = document.querySelectorAll(".goal");
    equaliseButtons(goals);
  } catch (error) {
    console.error(error.message);
  }
}

skipButton.addEventListener("click", async () => {
  await updateGoalsDue();
  window.location.href = await nextPage(supabase, user, "goals");
});

continueButton.addEventListener("click", async () => {
  const goal = document.querySelector(".goal.selected");
  if (!goal) {
    errorElem.classList.remove("hidden");
    return;
  }
  const image = document.querySelector(".goal-image.selected");
  const values = {
    goal_id: goal.dataset.row,
    goal_description: goal.dataset.custom === "true" ? goal.textContent : "",
    goal_image: image ? image.getAttribute("src").replace("..", "") : null,
  };
  const { error } = await supabase.from("user_details").update(values).eq("user_id", user.id);
  if (error) {
    console.log("Error updating goals in user_details on continue in assess.js");
  }
  await updateGoalsDue();
  window.location.href = await nextPage(supabase, user, "goals");
});

/*//courasel funcionality
const prev = document.getElementById('prev-btn')
const next = document.getElementById('next-btn')
const list = document.getElementById('item-list')

const itemWidth = 150
const padding = 10

prev.addEventListener('click',()=>{
  list.scrollLeft -= itemWidth + padding
})

next.addEventListener('click',()=>{
  list.scrollLeft += itemWidth + padding
})*/

import { supabase } from "./supabase.js";

const userIcon = document.querySelector(".user-icon");
const userAvatar = document.querySelector(".user-avatar");

// set the personalised/default user avatar
async function setAvatar() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // get user_details record for user
  const { data, error } = await supabase.from("user_details").select("*").eq("user_id", user.id);
  // if user_details record found is valid, set personalised avatar, otherwise set default
  if (!error && data && data.length > 0 && data[0].goal_image) {
    userAvatar.src = data[0].goal_image;
    userAvatar.classList.add("personalised");
  } else {
    userAvatar.src="/static/user-icon-10.png";
  }
  // set opacity to fade the icon in
  userAvatar.style.opacity = "1";
}

userAvatar.addEventListener("load", () => {
  userAvatar.style.opacity = "1";
});

// Wait for the DOM to be fully loaded before executing the code
document.addEventListener("DOMContentLoaded", async function () {
  // Select the user icon and the dropdown content elements
  const dropdownContent = document.querySelector(".dropdown-content");

  // set the avatar icon
  await setAvatar();

  // Toggle the "showIconItems" class on the dropdown content when the user icon is clicked
  userIcon.addEventListener("click", function () {
    console.log("clicked");
    dropdownContent.classList.toggle("showIconItems");
  });

  // Close the dropdown if the user clicks outside of it
  window.addEventListener("click", function (event) {
    // Check if the clicked element is not the user avatar
    if (!event.target.matches(".user-avatar")) {
      // Check if the dropdown is currently shown
      if (dropdownContent.classList.contains("showIconItems")) {
        // Remove the "showIconItems" class to hide the dropdown
        dropdownContent.classList.remove("showIconItems");
      }
    }
  });

  // Handle logout click
  const logoutLink = document.getElementById("logout");
  logoutLink.addEventListener("click", async function (event) {
    // Get information about the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If a user is present, sign them out
    if (user) {
      const { error } = await supabase.auth.signOut();
    }
    // Redirect the user to the login page after logout
    window.location.href = "/index.html";
  });
});

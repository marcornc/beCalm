import { supabase } from "./supabase.js";
// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "/index.html";
}

const imageLoader = document.querySelector("#fileInput");
const uploadButton = document.querySelector(".upload");
const filePicked = document.querySelector(".filePicked");

const backButton = document.querySelector(".backButton");
const menuButton = document.querySelector(".mainMenu");
const errorMessage = document.querySelector(".error");
const successMessage = document.querySelector(".success");
const description = document.querySelector(".description");

let thumbnailImage = null;

backButton.addEventListener("click", () => {
  window.location.href = "./personalExpression.html";
});

menuButton.addEventListener("click", () => {
  window.location.href = "./menu.html";
});

imageLoader.addEventListener("change", async () => {
  filePicked.textContent = imageLoader.files[0] ? imageLoader.files[0].name : "No file selected";
  if (imageLoader.files[0]) {
    filePicked.textContent = imageLoader.files[0].name;
    canvas.classList.remove("hidden");
    thumbnailImage = await createThumbnail(imageLoader.files[0], 400);
  } else {
    filePicked.textContent = "No file selected";
    canvas.classList.add("hidden");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    thumbnailImage = null;
  }
  
  description.value = "";
  errorMessage.classList.add("hidden");
  successMessage.classList.add("hidden");
  description.focus();
});

uploadButton.addEventListener("click", handleImage, false);
const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");

async function handleImage(e) {
  try {
    if (description.value.trim().length === 0) {
      throw new Error("Please enter a description");
    }
    if (!thumbnailImage) {
      throw new Error("Please select an image to upload");
    }
    const filenameTimestamp = new Date().toISOString();
    const thumbnailData = await uploadThumbnail(filenameTimestamp, thumbnailImage);
    const imageData = await uploadImage(filenameTimestamp);
    const values = {
      user_id: user.id,
      description: description.value,
      thumbnail_path: thumbnailData.path,
      image_path: imageData.path,
    };
    const { error } = await supabase.from("mandala_images").insert(values);
    if (error) {
      throw new Error(`Error inserting mandala reference in database: ${error}`);
    }
    successMessage.classList.remove("hidden");
    errorMessage.classList.add("hidden");
  } catch (error) {
    successMessage.classList.add("hidden");
    errorMessage.textContent = error.message;
    errorMessage.classList.remove("hidden");
  }
}

// function takes a file, resizes it by writing it to a canvas and then returns the canvas as an image file
async function createThumbnail(file, width) {
  // I couldn't find a way to do this without using this new Promise
  return new Promise((resolve) => {
    var reader = new FileReader();
    reader.onload = function (event) {
      var img = new Image();
      // this function is called once the image has finished loading, and write the image to a canvas to resize it
      img.onload = function () {
        // this function is called
        const thumbnailWidth = width;
        const thumbnailHeight = (img.height / img.width) * thumbnailWidth;
        canvas.width = thumbnailWidth;
        canvas.height = thumbnailHeight;
        ctx.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight);
        // conver the canvas image to an image file and return it
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadThumbnail(filenameTimestamp, blob) {
  try {
    const { data, error } = await supabase.storage.from("images").upload(`\\${user.id}\\thumbnails\\thumbnail ${filenameTimestamp}`, blob, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      throw new Error(`Error uploading thumbnail: ${error}`);
    }
    return data;
  } catch (e) {
    throw new Error(`Error uploading thumbnail: ${e}`);
  }
}

async function uploadImage(filenameTimestamp) {
  try {
    const { data, error } = await supabase.storage.from("images").upload(`\\${user.id}\\images\\image ${filenameTimestamp}`, imageLoader.files[0], {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      throw new Error(`Error uploading image: ${error}`);
    }
    return data;
  } catch (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }
}


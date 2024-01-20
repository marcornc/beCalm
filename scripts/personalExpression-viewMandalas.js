import { supabase } from "./supabase.js";
// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "/index.html";
}

// set constants for html elements
const backButton = document.querySelector(".backButton");
const menuButton = document.querySelector(".mainMenu");
const thumbnailContainer = document.querySelector(".thumbnailContainer");
const mandalaImage = document.querySelector(".mandalaImage");
const closeMandala = document.querySelector(".buttons-container");
const errorMessage = document.querySelector(".error");
const noMandalasMessage = document.querySelector(".no-mandalas");
let mandalaDataWithUrls = null;

// set event listeners for buttons
backButton.addEventListener("click", () => {
  window.location.href = "./personalExpression.html";
});

menuButton.addEventListener("click", () => {
  window.location.href = "./menu.html";
});

closeMandala.addEventListener("click", () => {
  mandalaImage.classList.add("hidden");
  closeMandala.classList.add("hidden");
  thumbnailContainer.classList.remove("hidden");
});

function createArticleEntry(mandalaData) {}

// get the saved mandala records from the database mandala_images table for the user
async function getDatabaseThumbnails() {
  const { data, error } = await supabase.from("mandala_images").select("*").eq("user_id", user.id).order("created_date", { ascending: false });

  if (error) {
    throw new Error(`Error reading mandala images from database: ${error.message}`);
  }

  const mandalaData = [];
  // for each mandala_images record, create a mandala data object and push to the array
  for (let mandala of data) {
    mandalaData.push({
      timestamp: mandala.created_date,
      date: formatDate(mandala.created_date),
      description: mandala.description,
      thumbnailPath: mandala.thumbnail_path.replace(/\\/g, "/").slice(1),
      imagePath: mandala.image_path.replace(/\\/g, "/").slice(1),
    });
  }

  // return the final array of mandala data objects
  return mandalaData;
}

// create Article node using DOM manipulation
function createArticleNode(mandala) {
  // create article wrapper
  const article = document.createElement("Article");
  article.classList.add("singleSD");
  article.dataset.timestamp = mandala.timestamp;
  article.addEventListener("click", selectThumbnail);

  // create background div
  const background = document.createElement("div");
  background.classList.add("background");
  article.appendChild(background);

  const imgBox = document.createElement("div");
  imgBox.classList.add("imgBoxSD");
  const img = document.createElement("img");
  img.src = mandala.signedUrl;
  img.alt = "mandala image";
  imgBox.appendChild(img);
  article.appendChild(imgBox);

  // create imageText div
  const imageText = document.createElement("div");
  imageText.classList.add("imageText");
  const createdDate = document.createElement("p");
  createdDate.classList.add("imgTitle");
  createdDate.textContent = mandala.date;
  imageText.appendChild(createdDate);
  const description = document.createElement("p");
  description.textContent = mandala.description;
  imageText.appendChild(description);
  article.appendChild(imageText);
  thumbnailContainer.appendChild(article);
}

// appends the thumbnail signedUrl from supabase to the mandala data from the database
// to give an array of mandala objects that contain the createdDate, description, thumbnailPath and the signedUrl
function appendUrlsToMandalaData(mandalaData, urlData) {
  const thumbnailUrls = {};
  for (let thumbnail of urlData) {
    thumbnailUrls[thumbnail.path] = thumbnail.signedUrl;
  }
  for (let mandala of mandalaData) {
    mandala["signedUrl"] = thumbnailUrls[mandala.thumbnailPath];
  }
  return mandalaData;
}

// format the data returned by supabase to human-readable
function formatDate(dateString) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" };
  return new Date(dateString).toLocaleString("en-GB", options).replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, "$3/$2/$1 $4");
}

// display the higher-resolution image of the mandala when a thumbnail is clicked on
async function selectThumbnail(event) {
  const timestamp = event.target.dataset.timestamp;
  for (let mandala of mandalaDataWithUrls) {
    // match the timestamp of the clicked thumbnail with the timestamp in the mandala object
    if (mandala.timestamp === timestamp) {
      // get the signedUrl for the full image
      const { data: urlData, error } = await supabase.storage.from("images").createSignedUrls([mandala.imagePath], 60);
      if (error) {
        throw new Error("Error getting image signedURl: ", error);
      }
      // extract the signedUrl from the returned data
      const imageUrl = urlData[0].signedUrl;
      // set the html image source to be the signedUrl
      mandalaImage.src = imageUrl;
      // show the image and close button and hide the thumbnails
      mandalaImage.classList.remove("hidden");
      closeMandala.classList.remove("hidden");
      thumbnailContainer.classList.add("hidden");
      break;
    }
  }
}

// main program
try {
  // get mandala_images data from the database for the user
  const mandalaData = await getDatabaseThumbnails();
  // extract the thumbnail paths from the mandala records to send to supabase to get the signedUrls for those images
  const filenames = mandalaData.map((mandala) => mandala.thumbnailPath);

  if (filenames.length === 0) {
    noMandalasMessage.classList.remove("hidden");
  } else {
    // get signedUrls for the thumbnail images from supabase - these are used to show the images on the page and are time-limited
    const { data: urlData, error } = await supabase.storage.from("images").createSignedUrls(filenames, 60);
    if (error) {
      throw new Error("Error getting thumbnail signedURls: ", error);
    }

    // add signedUrls to the mandalaData objects to consolidate all data for each mandala in one object
    mandalaDataWithUrls = appendUrlsToMandalaData(mandalaData, urlData);

    // use DOM manipulation to create an Article html node for each mandala record to show the thumbnail image, data and description
    for (let mandala of mandalaDataWithUrls) {
      createArticleNode(mandala);
    }
  }
} catch (error) {
  errorMessage.textContent = error.message;
  errorMessage.classList.remove("hidden");
}

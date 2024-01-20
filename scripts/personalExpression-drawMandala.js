// check if device is touch-enabled or not
import { supabase } from "./supabase.js";
// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "/index.html";
}

const isTouchEnabled = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

const container = document.querySelector(".main-container");
const background = document.querySelector(".background");
const backgroundCTX = background?.getContext("2d");
const drawing = document.querySelector(".drawing");
const mandala = document.querySelector(".mandala");
const backButton = document.querySelector(".backButton");
const menuButton = document.querySelector(".mainMenu");
// get access to css root variables
const rootStyles = getComputedStyle(document.documentElement);

const lineWidthInput = document.querySelector(".line-width");
const lineWidthDisplay = document.querySelector(".line-width-display");
const mirrorsInput = document.querySelector(".mirrors");
const mirrorsDisplay = document.querySelector(".mirrors-display");
const colourPicker = document.querySelector("#colour-picker");
const colourPreview = document.querySelector(".colour-preview");

const ctx = drawing?.getContext("2d");
let rect = false;
let lastX = 0;
let lastY = 0;
let lastAngle = 0;
let lastDistance = 0;
let parts = 12;
let mirror = true;

//----------------------------
// add event listeners for mouse events for drawing
//----------------------------
const endEventTrigger = isTouchEnabled ? "touchend" : "mouseup";
drawing?.addEventListener(
  endEventTrigger,
  function (e) {
    e.preventDefault();
    rect = false;
  },
  { passive: false }
);

const moveEventTrigger = isTouchEnabled ? "touchmove" : "mousemove";
drawing?.addEventListener(
  moveEventTrigger,
  (e) => {
    drawCanvasSingle(e);
    // if (Number(parts) === 1) {
    //   drawCanvasSingle(e);
    // } else {
    //   drawCanvasMultiple(e);
    // }
  },
  { passive: false }
);

// Attach a mousedown event listener to the document
const startEventTrigger = isTouchEnabled ? "touchstart" : "mousedown";
drawing?.addEventListener(
  startEventTrigger,
  function (e) {
    e.preventDefault();
    // Get the bounding rectangle of the drawing element
    rect = drawing.getBoundingClientRect();

    // Calculate the normalized coordinates of the mouse click within the canvas
    const x = isTouchEnabled ? e.touches[0].clientX : e.clientX;
    const y = isTouchEnabled ? e.touches[0].clientY : e.clientY;
    lastX = ((x - rect.x) / rect.width) * 1024;
    lastY = ((y - rect.y) / rect.width) * 1024;

    // Calculate the angle between the center of the canvas and the mouse click in degrees
    lastAngle = (((Math.atan2(lastY - 512, lastX - 512) * 180) / Math.PI + 450) % 360) / 90;

    // Calculate the distance from the center of the canvas to the mouse click
    lastDistance = Math.sqrt(Math.pow(lastY - 512, 2) + Math.pow(lastX - 512, 2));
  },
  { passive: false }
);

//----------------------------
// add event listener for screen size changes
//----------------------------

window?.addEventListener("resize", sizeMandala);

function sizeMandala() {
  const containerWidth = container.getBoundingClientRect().width;
  const size = containerWidth * 0.8;
  mandala.style.width = `${size}px`;
  mandala.style.height = `${size}px`;
  drawing.style.height = `${size}px`;
  drawing.style.width = `${size}px`;
  background.style.height = `${size * 0.9}px`;
  background.style.width = `${size * 0.9}px`;
}

//----------------------------
// add event listeners for changes to drawing parameters
//----------------------------

colourPicker.addEventListener("input", function () {
  colourPreview.style.backgroundColor = this.value;
  ctx.strokeStyle = this.value;
  ctx.fillStyle = this.value;
});

lineWidthInput.addEventListener("input", setLineWidth);

mirrorsInput.addEventListener("input", setMirrors);

function setLineWidth() {
  const value = lineWidthInput.value;
  lineWidthDisplay.textContent = `Line Width: ${value}`;
  ctx.lineWidth = value;
}

function setMirrors() {
  const value = mirrorsInput.value;
  mirrorsDisplay.textContent = `Mirrors: ${value}`;
  parts = value;
}

backButton.addEventListener("click", () => {
  window.location.href = "./personalExpression.html";
});

menuButton.addEventListener("click", () => {
  window.location.href = "./menu.html";
});

//----------------------------
// add event listeners for buttons
//----------------------------

document.querySelector(".clear")?.addEventListener("click", clearDrawing);
document.querySelector(".download")?.addEventListener("click", download);

// allow download of drawn image
function download() {
  let link = document.createElement("a");
  link.setAttribute("download", "mandala.png");
  link.setAttribute("href", drawing.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  link.click();
}

//----------------------------
// drawing functions
//----------------------------

// clear the drawing canvas
function clearDrawing() {
  ctx.clearRect(0, 0, cwidth, cheight);
}

function drawCanvasSingle(e) {
  e.preventDefault();

  // Check if rect (bounding rectangle) is available
  if (!rect) {
    return false;
  }

  const x = isTouchEnabled ? e.touches[0].clientX : e.clientX;
  const y = isTouchEnabled ? e.touches[0].clientY : e.clientY;

  let thisX = ((x - rect.x) / rect.width) * 1024;
  let thisY = ((y - rect.y) / rect.width) * 1024;

  ctx.beginPath();
  ctx.arc(thisX, thisY, (ctx.lineWidth - 1) / 2, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(thisX, thisY);
  ctx.stroke();

  lastX = thisX;
  lastY = thisY;
}

// draw on the canvas as the mouse moves for parts > 1
function drawCanvasMultiple(e) {
  e.preventDefault();
  // Check if rect (bounding rectangle) is available
  if (!rect) {
    return false;
  }

  // Calculate the normalized coordinates of the current mouse position within the canvas
  const x = isTouchEnabled ? e.touches[0].clientX : e.clientX;
  const y = isTouchEnabled ? e.touches[0].clientY : e.clientY;

  let thisX = ((x - rect.x) / rect.width) * 1024;
  let thisY = ((y - rect.y) / rect.width) * 1024;

  // Calculate the angle between the center of the canvas and the current mouse position in degrees
  let thisAngle = (((Math.atan2(thisY - 512, thisX - 512) * 180) / Math.PI + 450) % 360) / 90;

  // Calculate the distance from the center of the canvas to the current mouse position
  let thisDistance = Math.sqrt(Math.pow(thisY - 512, 2) + Math.pow(thisX - 512, 2));

  // Iterate over the specified number of parts
  for (let i = 0; i < parts; i++) {
    let newAngle1;
    let newAngle2;

    // Mirror effect: adjust angles for every second part (if enabled)
    if (mirror && (i % 2 !== 0 || parts % 2 != 0)) {
      newAngle1 = 4 - thisAngle - (4 / parts) * (i - 1);
      newAngle2 = 4 - lastAngle - (4 / parts) * (i - 1);
    } else {
      newAngle1 = thisAngle + (4 / parts) * i;
      newAngle2 = lastAngle + (4 / parts) * i;
    }

    // Calculate coordinates for the current and previous points based on angles and distances
    let cX = 512 + thisDistance * Math.sin(newAngle1 * (Math.PI / 2));
    let cY = 512 + thisDistance * Math.sin((newAngle1 - 1) * (Math.PI / 2));

    let dX = 512 + lastDistance * Math.sin(newAngle2 * (Math.PI / 2));
    let dY = 512 + lastDistance * Math.sin((newAngle2 - 1) * (Math.PI / 2));

    // Draw a filled circle at the current coordinates
    ctx.beginPath();
    ctx.arc(cX, cY, (ctx.lineWidth - 1) / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw a line connecting the current and previous points
    ctx.beginPath();
    ctx.moveTo(cX, cY);
    ctx.lineTo(dX, dY);
    ctx.stroke();
  }

  // Update the lastAngle and lastDistance for the next iteration
  lastAngle = thisAngle;
  lastDistance = thisDistance;
}

//----------------------------
// innitialise the page and canvas elements
//----------------------------

var cwidth = 1024;
var cheight = 1024;
background.width = cwidth;
background.height = cheight;
drawing.width = cwidth;
drawing.height = cheight;

// initialse values for sliders
setLineWidth();
setMirrors();

drawing.lineCap = "round";

ctx.strokeStyle = "#f00";
ctx.fillStyle = "#f00";

clearDrawing();
sizeMandala();


// set constants for html elements on page
const centre = document.querySelector("#centre");
const breatheButton = document.querySelector(".breathe");
const stopButton = document.querySelector(".stop");
const inhaleRangeInput = document.querySelector('.inhaleDuration');
const inhaleRangeDisplay = document.querySelector(".inhaleDurationDisplay");
const inhalePauseInput = document.querySelector(".inhalePause");
const inhalePauseDisplay = document.querySelector(".inhalePauseDisplay");
const exhaleRangeInput = document.querySelector(".exhaleDuration");
const exhaleRangeDisplay = document.querySelector(".exhaleDurationDisplay");
const exhalePauseInput = document.querySelector(".exhalePause");
const exhalePauseDisplay = document.querySelector(".exhalePauseDisplay");
const slowButton = document.querySelector(".slow");
const avgButton = document.querySelector(".avg");
const fastButton = document.querySelector(".fast");
const startStopButton = document.querySelector(".start_stop");
const bubblePosition = document.querySelector(".bubble_position");

//add event to start and stop to breathe, on the same button
startStopButton.addEventListener("click", () => {
  if (isBreathing) {
    stop();
    startStopButton.textContent = "Start";
  } else {
    breathe();
    startStopButton.textContent = "Stop";
  }
});

// set up control variables used in the breathing cycle
let nextBreath = breatheOut;
let isBreathing = false;

// set constants for component sizes and rotation amount
const bubbleSizeLarge = 250;
const bubbleSizeSmall = 75;

// declare time variable for breathing callbacks
let timerId = null;

// declare variables to contain the durations that are used by the animations
let inhaleDuration = 0;
let inhalePause = 0;
let exhaleDuration = 0;
let exhalePause = 0;

//pre-set breathing button
slowButton.addEventListener("click", () => {
  inhaleRangeInput.value = 40;
  inhalePauseInput.value = 40;
  exhaleRangeInput.value = 80;
  exhalePauseInput.value = 80;
  inhaleDuration = setRangeSlider(inhaleRangeInput, inhaleRangeDisplay, "Inhale Duration:");
  inhalePause = setRangeSlider(inhalePauseInput, inhalePauseDisplay, "Inhale Pause:");
  exhaleDuration = setRangeSlider(exhaleRangeInput, exhaleRangeDisplay, "Exhale Duration:");
  exhalePause = setRangeSlider(exhalePauseInput, exhalePauseDisplay, "Exhale Pause:");

});

avgButton.addEventListener("click", () => {
  inhaleRangeInput.value = 20;
  inhalePauseInput.value = 20;
  exhaleRangeInput.value = 40;
  exhalePauseInput.value = 60;
  inhaleDuration = setRangeSlider(inhaleRangeInput, inhaleRangeDisplay, "Inhale Duration:");
  inhalePause = setRangeSlider(inhalePauseInput, inhalePauseDisplay, "Inhale Pause:");
  exhaleDuration = setRangeSlider(exhaleRangeInput, exhaleRangeDisplay, "Exhale Duration:");
  exhalePause = setRangeSlider(exhalePauseInput, exhalePauseDisplay, "Exhale Pause:");
});

fastButton.addEventListener("click", () => {
  inhaleRangeInput.value = 10;
  inhalePauseInput.value = 10;
  exhaleRangeInput.value = 20;
  exhalePauseInput.value = 30;
  inhaleDuration = setRangeSlider(inhaleRangeInput, inhaleRangeDisplay, "Inhale Duration:");
  inhalePause = setRangeSlider(inhalePauseInput, inhalePauseDisplay, "Inhale Pause:");
  exhaleDuration = setRangeSlider(exhaleRangeInput, exhaleRangeDisplay, "Exhale Duration:");
  exhalePause = setRangeSlider(exhalePauseInput, exhalePauseDisplay, "Exhale Pause:");
});

// initialse values for sliders
inhaleDuration = setRangeSlider(inhaleRangeInput, inhaleRangeDisplay, "Inhale Duration:");
inhalePause = setRangeSlider(inhalePauseInput, inhalePauseDisplay, "Inhale Pause:");
exhaleDuration = setRangeSlider(exhaleRangeInput, exhaleRangeDisplay, "Exhale Duration:");
exhalePause = setRangeSlider(exhalePauseInput, exhalePauseDisplay, "Exhale Pause:");


// function to set the slider values and update the displayed value 
function setRangeSlider(sliderElement, displayElement, label) {
    const value = (sliderElement.value / 10).toFixed(1);
    displayElement.textContent = `${label} ${value}`;
    return value;
}

// set the event listeners for the sliders - initialises the animation values
inhaleRangeInput.addEventListener("input", () => {
  inhaleDuration = setRangeSlider(inhaleRangeInput, inhaleRangeDisplay, "Inhale Duration:");
});

inhalePauseInput.addEventListener("input", () => {
  inhalePause = setRangeSlider(inhalePauseInput, inhalePauseDisplay, "Inhale Pause:");
});

exhaleRangeInput.addEventListener("input", () => {
  exhaleDuration = setRangeSlider(exhaleRangeInput, exhaleRangeDisplay, "Exhale Duration:");
});

exhalePauseInput.addEventListener("input", () => {
  exhalePause = setRangeSlider(exhalePauseInput, exhalePauseDisplay, "Exhale Pause:");
});



// perform animation for breathe out:
// change colours for bubble
// reduce bubble size to small
// set up timer callback for next breath
function breatheOut() {
  nextBreath = breatheIn;
  const colour = Math.floor(Math.random() * (200 + 1)) - 100;
  const tl = gsap.timeline();
  tl.add("start");
  // animate lung size change
  tl.to(
    ".bubble",
    {
      width: `${bubbleSizeSmall}px`,
      height: `${bubbleSizeSmall}px`,
      backgroundColor: `hsl(+=${colour}, 80%, 50%)`,
      duration: Number(exhaleDuration),
    },
    "start"
  );
  // set up timer callback for next breath
  timerId = setTimeout(() => breatheIn(true), Number(exhaleDuration) * 1000 + Number(exhalePause) * 1000);
}

// perform animations for breathe in:
// change colours for bubble
// increase bubble size to large
// set up timer callback for next breath
function breatheIn() {
  nextBreath = breatheOut;
  const colour = Math.floor(Math.random() * (200 + 1)) - 100;
  const tl = gsap.timeline({ repeatRefresh: true });
  tl.add("start");
  // animate lung size change
  tl.to(
    ".bubble",
    {
      width: `${bubbleSizeLarge}px`,
      height: `${bubbleSizeLarge}px`,
      backgroundColor: `hsl(+=${colour}, 80%, 50%)`,
      duration: Number(inhaleDuration),
    },
    "start"
  );
  // set up timer callback for next breath
  timerId = setTimeout(() => breatheOut(true), Number(inhaleDuration) * 1000 + Number(inhalePause) * 1000);
}

// start breathing cycle
// TODO keep track of last breath to start the cycle at the right place
function breathe() {
  // ignore click if already breathing
  if (isBreathing) return;
  isBreathing = true;
  nextBreath();
}

// stop breathing cycle
function stop() {
  // ignore click if not breathing;
  if (!isBreathing) return;
  isBreathing = false;
  clearTimeout(timerId);
}




// create the breathing bubble element
const createBubble = () => {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubblePosition.appendChild(bubble);
  // set default size for the bubble HTML element
  bubble.style.width = bubble.style.height = `${bubbleSizeLarge}px`;
};

// create the centre circle html element
createBubble();
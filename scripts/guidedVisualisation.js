import { supabase } from "./supabase.js";
import { exerciseDone } from "./exerciseDone.js";

// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "./login.html";
}
// declare elements from html as variables
const introduction = document.querySelector('.introduction-GV');
const backButton = document.querySelector('.main-menu');
const audioList = document.querySelector('.audio-list-GV');

// array of day buttons
const dayButtons = [
  document.querySelector('.day1-GV'),
  document.querySelector('.day2-GV'),
  document.querySelector('.day3-GV'),
  document.querySelector('.day4-GV'),
  document.querySelector('.day5-GV'),
  document.querySelector('.day6-GV'),
  document.querySelector('.day7-GV'),
];

// on click, go to introduction page
introduction?.addEventListener('click', () => {
  window.location.href = './introduction-guideVisualisation-audio.html';
});


// on click, go to Guided Visualisation audio page for that day
[...dayButtons]?.forEach((button, index) => {
  const number = index + 1;
  const numberText = number === 1 ? 'day1-' : number === 2 ? 'day2-' : number === 3 ? 'day3-' : number === 4 ? 'day4-' : number === 5 ? 'day5-' : number === 6 ? 'day6-' : number === 7 ? 'day7-' : '';
  button?.addEventListener('click', () => {
    window.location.href = `./${numberText}guideVisualisation-audio.html`;
  });
});

// on click, go to menu page
backButton?.addEventListener('click', () => {
  window.location.href = '../menu.html';
});

// on click, go to guided visualisation audio list page
audioList?.addEventListener('click', () => {
  window.location.href = './guidedVisualisation.html';
});

await exerciseDone(supabase, user);
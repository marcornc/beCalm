import { supabase } from "./supabase.js";
import { exerciseDone } from "./exerciseDone.js";

// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "../login.html";
}
// declare elements from html as variables
const backButton = document.querySelector('.main-menu');
const audioList = document.querySelector('.audio-list');

// array of day buttons
const dayButtons = [
   document.querySelector('.day1-CM'),
   document.querySelector('.day2-CM'),
   document.querySelector('.day3-CM'),
   document.querySelector('.day4-CM'),
   document.querySelector('.day5-CM'),
   document.querySelector('.day6-CM'),
   document.querySelector('.day7-CM'),
]

// on click, go to menu page
backButton?.addEventListener('click', () => {
  window.location.href = '../menu.html';
});

// on click, go to Calm Mind audio page for that day
[...dayButtons]?.forEach((button, index) => {
  const number = index + 1;
  const numberText = number === 1 ? 'One' : number === 2 ? 'Two' : number === 3 ? 'Three' : number === 4 ? 'Four' : number === 5 ? 'Five' : number === 6 ? 'Six' : number === 7 ? 'Seven' : '';
  button?.addEventListener('click', () => {
    window.location.href = `./calmMind${numberText}.html`;
  });
});

// on click, go to guided visualisation audio list page
audioList?.addEventListener('click', () => {
  window.location.href = './calmMind.html';
});

await exerciseDone(supabase, user);



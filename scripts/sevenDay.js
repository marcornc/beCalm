import { supabase } from "./supabase.js";

// check if user logged in - if not, redirect to logon page
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  window.location.href = "./login.html";
}

// get user_details record for user
const { data: userData, error:userDataError } = await supabase.from("user_details").select("*").eq("user_id", user.id);

const backButton = document.querySelector('.main-menu');
const day1 = document.querySelector('.day1');
const day2 = document.querySelector('.day2');
const day3 = document.querySelector('.day3');
const day4 = document.querySelector('.day4');
const day5 = document.querySelector('.day5');
const day6 = document.querySelector('.day6');
const day7 = document.querySelector('.day7');



backButton.addEventListener('click', () => {
  window.location.href = './menu.html';
});

day1.addEventListener('click', async () => {
  if (userData && userData.length > 0 && !userDataError) {
    const dbDateIsToday = new Date(userData[0].last_exercise_date) === new Date();
    const values = {
      program_duration: 7,
      program_days_spent: dbDateIsToday ? 1 : 0,
      last_exercise_date: dbDateIsToday ? new Date() : null
    }
    const { error } = await supabase.from("user_details").update(values).eq("user_id", user.id);
    // if error, show info message in console but continue without starting 7 day program
    if (error) {
      console.log("Could not join 7 Day program in sevenDay.js")
    }
  }
  window.location.href = './calmBreathing.html';
});

day2.addEventListener('click', () => {
  window.location.href = './calmBreathing.html';
});

day3.addEventListener('click', () => {
  window.location.href = './calmMindAudios/calmMindOne.html';
});

day4.addEventListener('click', () => {
    window.location.href = './calmMindAudios/calmMindThree.html';
    });

day5.addEventListener('click', () => {
    window.location.href = './personalExpression.html';
    });

day6.addEventListener('click', () => {
    window.location.href = './guideVisualisation-audio/introduction-guideVisualisation-audio.html';
    });

day7.addEventListener('click', () => {
    window.location.href = './guideVisualisation-audio/day2-guideVisualisation-audio.html';
    });

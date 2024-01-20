class UserDetailsError extends Error {
  constructor(message) {
    super(message);
    this.name = "UserDetailsError";
  }
}
export async function exerciseDone(supabase, user) {
  const doneButtons = document.querySelectorAll(".complete");
  const doneButtonIcons = document.querySelectorAll(".done");
  const doneButtonTexts = document.querySelectorAll(".text");
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  try {
    // get initial values for user_details from database for user
    const initialValues = await getCurrentUserDetails(supabase, user);
    // if not on program or program is complete, leave the 'done' button hidden
    // console.log("programDaysSpent: ", initialValues.programDaysSpent, " duration: ", initialValues.programDuration, " date: ", new Date(initialValues.lastExerciseDate), " currentDate: ", currentDate);
    if (!initialValues.programDuration || 
        (initialValues.programDaysSpent >= initialValues.programDuration && new Date(initialValues.lastExerciseDate) < currentDate)) {
      return;
    }
    // if on the program and an exercise has been completed today, show the button but disable it)
    // need to use the getTime() function to compare the dates, as without it the object references are compared
    if (new Date(initialValues.lastExerciseDate).getTime() === currentDate.getTime()) {
      doneButtons.forEach(button => {
        button.classList.remove("hidden");
        button.querySelector(".done").classList.remove("hidden");
        button.querySelector(".text").textContent = ` Day ${initialValues.programDaysSpent} Done`;
        button.disabled = true;
      })

      return;
    }

    // update done button text to show today's exercise day number and show the button
    doneButtons.forEach(button => {
      button.querySelector(".text").textContent = ` Day ${initialValues.programDaysSpent + 1} Done`;
      button.classList.remove("hidden");
    })

  doneButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const feedbackDue = await updateExerciseDone(supabase, user, initialValues);
      if (!button.querySelector('.done').classList.contains("hidden") && feedbackDue) {
        window.location.href = "./assess.html";
      }
    });
  })


  } catch (error) {
    // if there is a user details error, continue without program tracking, but log a message in the console for awareness
    if (error instanceof UserDetailsError) {
      console.log(`Error tracking 7-day program (program continues to run without tracking: ${error})`);
    } else {
      throw error;
    }
  }

  // get current program details from database user_details table for the user and return the values in an object
  async function getCurrentUserDetails(supabase, user) {
    // get exercise progress values from database for user
    const { data, error } = await supabase.from("user_details").select("*").eq("user_id", user.id);
    if (error || !data || data.length === 0) {
      throw new UserDetailsError("Could not get user details from database");
    }
    // return the initial values in an object
    return {
      programDuration: data[0].program_duration,
      programDaysSpent: data[0].program_days_spent,
      lastExerciseDate: data[0].last_exercise_date,
      feedbackDue: data[0].feedback_due,
    };
  }

  async function updateExerciseDone(supabase, user, initialValues) {
    doneButtonIcons.forEach(icon => {
      icon.classList.toggle("hidden");
    })
    // initialise new values as those read when the page loaded
    const values = {
      program_duration: initialValues.programDuration,
      program_days_spent: initialValues.programDaysSpent,
      last_exercise_date: initialValues.lastExerciseDate,
      feedback_due: initialValues.feedbackDue,
    };
    // if the doneIcon is not hidden and no exercise has been completed today
    if (!doneButtonIcons[0].classList.contains("hidden") && new Date(initialValues.lastExerciseDate).getTime() !== currentDate.getTime()) {
      // update values to reflect an new exercise completed today
      values.program_days_spent += 1,
      values.last_exercise_date = new Date(),
      values.feedback_due = initialValues.programDaysSpent + 1 === initialValues.programDuration ? true : false;
    }
    // update the database with the new user_details
    const { error } = await supabase.from("user_details").update(values).eq("user_id", user.id);
    if (error) {
      throw new UserDetailsError(`Error updating exercise details in user_details in calmBreathing.js: ${error}`);
    }
    // return whether feedback is now due
    return values.feedback_due;
  }
}

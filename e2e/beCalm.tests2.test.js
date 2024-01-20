import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";
import { resetdb } from "../database/scripts/resetdb.js";
import { test, expect } from "@playwright/test";

const supabaseEmail = process.env.SUPABASE_EMAIL;
const supabasePasswordB = process.env.SUPABASE_PASSWORD_B;
const supabaseUrlB = process.env.SUPABASE_URL_B;
const supabaseKeyB = process.env.SUPABASE_KEY_B;

const supabase = createClient(supabaseUrlB, supabaseKeyB);

const { data, error } = await supabase.auth.signInWithPassword({
  email: supabaseEmail,
  password: supabasePasswordB,
});

if (error) throw new Error(`Error signing in to database: ${error}`);
const user = data.user;

async function getUserDetails() {
  const { data, error } = await supabase.from("user_details").select("*").eq("user_id", user.id);
  if (error || !data || data.length === 0) {
    throw new Error("Could not get user details from database");
  }
  return data[0];
}

function getDateMinusDays(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-11
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function login(page) {
  // start from index page
  await page.goto("http://127.0.0.1:5502/index.html");
  await expect(page).toHaveTitle("Becalm");
  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5502/pages/login.html");

  // go back to index page and then to login page
  await page.goto("http://127.0.0.1:5502/index.html");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByLabel("Email:").fill(supabaseEmail);
  await page.getByLabel("Password:").fill(supabasePasswordB);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test.describe("Tests with beforeEach login - on 7 day program", async () => {
  test.beforeEach(async ({ page }) => {
    await resetdb(supabase, user);
    await login(page);
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/disclaimer.html");
  });

  test("Test database update after starting 7-day program", async ({ page }) => {
    await page.goto("http://127.0.0.1:5502/pages/menu.html");
    const menuHeading = page.getByRole("heading", { name: "Welcome" });
    await expect(menuHeading).toHaveText("Welcome");
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/menu.html");

    await page.getByRole("article").filter({ hasText: "7 Day Programme" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/sevenDay.html");

    // check user_details fields from database before starting first day of program
    let userDetails = await getUserDetails();
    await expect(userDetails.program_duration).toBe(0);
    await expect(userDetails.program_days_spent).toBe(0);
    await expect(userDetails.last_exercise_date).toBe(null);

    //  -------------- test starting 7 day program updates database

    // pause to wait for sevenDay page to load
    await page.waitForTimeout(1000);

    const day1 = await page.getByRole("article").filter({ hasText: "Day 01" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // assert that the program duration has been updated and the days spent and last exercise date have not been updated
    userDetails = await getUserDetails();
    await expect(userDetails.program_duration).toBe(7);
    await expect(userDetails.program_days_spent).toBe(0);
    await expect(userDetails.last_exercise_date).toBe(null);
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // ------------------------ check exercise done day 1 functionality in calm breathing page

    // check "day 1 done" button is present and does not have a check mark
    await expect(page.getByRole("button", { name: " Day 1 Done" })).toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 1 Done" })).not.toBeVisible;
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // click on done button and check it updates
    await page.getByRole("button", { name: " Day 1 Done" }).click();
    await expect(page.getByRole("button", { name: " Day 1 Done" })).not.toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 1 Done" })).toBeVisible;

    // pause to give database time to update
    await page.waitForTimeout(1000);

    // assert that the program days spent is updated to 1 and last exercise date is updated to today's date
    userDetails = await getUserDetails();
    await expect(userDetails.program_duration).toBe(7);
    await expect(userDetails.program_days_spent).toBe(1);
    await expect(userDetails.last_exercise_date).toBe(getDateMinusDays(0));

    // undo the click and check the user_details values have been reverted
    await page.getByRole("button", { name: "✅ Day 1 Done" }).click();
    await expect(page.getByRole("button", { name: " Day 1 Done" })).toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 1 Done" })).not.toBeVisible;

    // pause to give database time to update
    await page.waitForTimeout(1000);

    // assert that the program days spent and last exercise date have been reverted
    userDetails = await getUserDetails();
    await expect(userDetails.program_duration).toBe(7);
    await expect(userDetails.program_days_spent).toBe(0);
    await expect(userDetails.last_exercise_date).toBe(null);

    // click done button again to complete today's exercise
    await page.getByRole("button", { name: " Day 1 Done" }).click();
    await expect(page.getByRole("button", { name: " Day 1 Done" })).not.toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 1 Done" })).toBeVisible;

    // pause to give database time to update
    await page.waitForTimeout(1000);

    // assert that the program days spent is updated to 1 and last exercise date is updated to today's date
    userDetails = await getUserDetails();
    await expect(userDetails.program_duration).toBe(7);
    await expect(userDetails.program_days_spent).toBe(1);
    await expect(userDetails.last_exercise_date).toBe(getDateMinusDays(0));

    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // ------------------------ check exercise done day 2 functionality in calm breathing page

    // navigate back to menu
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/menu.html");

    // update user_details record to set last_exercise_date to yesterday to enable day 2 test
    const { day2Error } = await supabase
      .from("user_details")
      .update({ last_exercise_date: getDateMinusDays(1) })
      .eq("user_id", user.id);
    if (day2Error) throw new Error(`Error updating user_details record in database on day 2 ${day2Error}`);

    // go to calm breathing page
    // pause to give page time to load
    await page.waitForTimeout(1000);
    await page.getByRole("article").filter({ hasText: "Calm Breathing" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // check "day 2 done" button is present and does not have a check mark
    await expect(page.getByRole("button", { name: " Day 2 Done" })).toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 2 Done" })).not.toBeVisible;
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // click on done button and check it updates
    await page.getByRole("button", { name: " Day 2 Done" }).click();
    await expect(page.getByRole("button", { name: " Day 2 Done" })).not.toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 2 Done" })).toBeVisible;

    // pause to give database time to update
    await page.waitForTimeout(1000);

    // assert that the program days spent is updated to 2 and last exercise date is updated to today's date
    userDetails = await getUserDetails();
    await expect(userDetails.program_duration).toBe(7);
    await expect(userDetails.program_days_spent).toBe(2);
    await expect(userDetails.last_exercise_date).toBe(getDateMinusDays(0));

    // undo the click and check the user_details values have been reverted
    await page.getByRole("button", { name: "✅ Day 2 Done" }).click();
    await expect(page.getByRole("button", { name: " Day 2 Done" })).toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 2 Done" })).not.toBeVisible;

    // pause to give database time to update
    await page.waitForTimeout(1000);

    // assert that the program days spent and last exercise date have been reverted
    userDetails = await getUserDetails();
    await expect(userDetails.program_duration).toBe(7);
    await expect(userDetails.program_days_spent).toBe(1);
    await expect(userDetails.last_exercise_date).toBe(getDateMinusDays(1));

    // click done button again to complete today's exercise
    await page.getByRole("button", { name: " Day 2 Done" }).click();
    await expect(page.getByRole("button", { name: " Day 2 Done" })).not.toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 2 Done" })).toBeVisible;

    // pause to give database time to update
    await page.waitForTimeout(1000);

    // assert that the program days spent is updated to 2 and last exercise date is updated to today's date
    userDetails = await getUserDetails();
    await expect(userDetails.program_duration).toBe(7);
    await expect(userDetails.program_days_spent).toBe(2);
    await expect(userDetails.last_exercise_date).toBe(getDateMinusDays(0));

    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // ------------------------ check exercise done days 3-6 functionality in calm breathing page
    for (let i = 3; i <= 6; i++) {
      // navigate back to menu
      await page.getByRole("button", { name: "Menu" }).click();
      await expect(page).toHaveURL("http://127.0.0.1:5502/pages/menu.html");

      // update user_details record to set last_exercise_date to yesterday to enable next day test
      const { error } = await supabase
        .from("user_details")
        .update({ last_exercise_date: getDateMinusDays(1) })
        .eq("user_id", user.id);
      if (error) throw new Error(`Error updating user_details record in database on day ${i}: ${error}`);

      // go to calm breathing page
      // pause to give page time to load
      await page.waitForTimeout(1000);
      await page.getByRole("article").filter({ hasText: "Calm Breathing" }).click();
      await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

      // check "day i done" button is present and does not have a check mark
      await expect(page.getByRole("button", { name: ` Day ${i} Done` })).toBeVisible;
      await expect(page.getByRole("button", { name: `✅ Day ${i} Done` })).not.toBeVisible;
      await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

      // click on done button and check it updates
      await page.getByRole("button", { name: ` Day ${i} Done` }).click();
      await expect(page.getByRole("button", { name: ` Day ${i} Done` })).not.toBeVisible;
      await expect(page.getByRole("button", { name: `✅ Day ${i} Done` })).toBeVisible;

      // pause to give database time to update
      await page.waitForTimeout(1000);

      // assert that the program days spent is updated to i and last exercise date is updated to today's date
      userDetails = await getUserDetails();
      await expect(userDetails.program_duration).toBe(7);
      await expect(userDetails.program_days_spent).toBe(i);
      await expect(userDetails.last_exercise_date).toBe(getDateMinusDays(0));
    }

    // ------------------------ check exercise done day 7 functionality in calm breathing page

    // navigate back to menu
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/menu.html");

    // update user_details record to set last_exercise_date to yesterday to enable day 7 test
    const { day7Error } = await supabase
      .from("user_details")
      .update({ last_exercise_date: getDateMinusDays(1) })
      .eq("user_id", user.id);
    if (day7Error) throw new Error(`Error updating user_details record in database on day 7: ${day7Error}`);

    // go to calm breathing page
    // pause to give page time to load
    await page.waitForTimeout(1000);
    await page.getByRole("article").filter({ hasText: "Calm Breathing" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // check "day 7 done" button is present and does not have a check mark
    await expect(page.getByRole("button", { name: " Day 7 Done" })).toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 7 Done" })).not.toBeVisible;
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // click on done button and check it updates
    await page.getByRole("button", { name: " Day 7 Done" }).click();

    // pause to give database time to update
    await page.waitForTimeout(1000);

    // assert that the program days spent is updated to 7, last exercise date is updated to today's date and assess_due is set to true
    userDetails = await getUserDetails();
    await expect(userDetails.program_duration).toBe(7);
    await expect(userDetails.program_days_spent).toBe(7);
    await expect(userDetails.last_exercise_date).toBe(getDateMinusDays(0));
    await expect(userDetails.feedback_due).toBe(true);

    // -------------------------- check that assessement page has loaded, fill in slider values and check database update

    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/assess.html");
    // pause to give page to load
    await page.waitForTimeout(1000);
    const wellbeingSlider = await page.getByLabel("Overall Wellbeing Rating");
    await wellbeingSlider.fill("7");
    await wellbeingSlider.dispatchEvent("change");
    await expect(wellbeingSlider).toHaveValue("7");

    const breathingSlider = await page.getByLabel("Breathing Rating");
    await breathingSlider.fill("8");
    await breathingSlider.dispatchEvent("change");
    await expect(breathingSlider).toHaveValue("8");

    const relaxSlider = await page.getByLabel("Relax Rating");
    await relaxSlider.fill("9");
    await relaxSlider.dispatchEvent("change");
    await expect(relaxSlider).toHaveValue("9");

    const expressSlider = await page.getByLabel("Express Rating");
    await expressSlider.fill("10");
    await expressSlider.dispatchEvent("change");
    await expect(expressSlider).toHaveValue("10");

    const visualiseSlider = await page.getByLabel("Visualise Rating");
    await visualiseSlider.fill("4");
    await visualiseSlider.dispatchEvent("change");
    await expect(visualiseSlider).toHaveValue("4");

    await page.getByRole("button", { name: "Continue" }).click();

    // pause to give database time to update
    await page.waitForTimeout(1000);

    // check user_progress record has been written and has correct values
    const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", user.id).eq("survey_date", getDateMinusDays(0));
    if (error || !data || data.length === 0 || data.length > 1) {
      throw new Error("Error getting user_progress record from database");
    }
    const userProgress = data[0];

    await expect(userProgress.wellbeing).toBe(7);
    await expect(userProgress.breathing).toBe(8);
    await expect(userProgress.relax).toBe(9);
    await expect(userProgress.express).toBe(10);
    await expect(userProgress.visualise).toBe(4);

    // -------------------------------- check that menu page is loaded after assessement submitted

    // pause to give page time to load
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/menu.html");

    // ------------------------ check exercise done day 7 after assessment - done button should appear but be disabled

    // go to calm breathing page
    // pause to give page time to load
    await page.waitForTimeout(1000);
    await page.getByRole("article").filter({ hasText: "Calm Breathing" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // check "day 7 done" button is present, has a check mark and is disabled
    await expect(page.getByRole("button", { name: " Day 7 Done" })).not.toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 7 Done" })).toBeVisible;
    await expect(page.getByRole("button", { name: "✅ Day 7 Done" })).toBeDisabled;
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // navigate back to menu
    // pause to give page time to load
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/menu.html");

    // ------------------------ check exercise done day 8 - done button should not appear

    // update user_details record to set last_exercise_date to yesterday to enable day 8 test
    const { day8Error } = await supabase
      .from("user_details")
      .update({ last_exercise_date: getDateMinusDays(1) })
      .eq("user_id", user.id);
    if (day8Error) throw new Error(`Error updating user_details record in database on day 7: ${day8Error}`);

    // go to calm breathing page
    // pause to give page time to load
    await page.waitForTimeout(1000);
    await page.getByRole("article").filter({ hasText: "Calm Breathing" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");

    // check "done" button is not present
    await expect(page.getByRole("button", { hasText: "Done" })).not.toBeVisible;
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");
  });
});

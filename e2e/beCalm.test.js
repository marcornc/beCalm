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

test.describe("Tests without beforeEach login", async () => {
  test.beforeEach(async ({ page }) => {
    await resetdb(supabase, user);
  });

  test("Test logging in and getting to disclaimer page", async ({ page }) => {
    // start from index page
    await page.goto("http://127.0.0.1:5502/index.html");
    await expect(page).toHaveTitle("Becalm");
    await page.getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/login.html");

    // got to reset password page
    await page.getByRole("link", { name: "Forgot your password" }).click();
    await expect(page).toHaveTitle("Becalm");

    // go back to index page and then to login page
    await page.goto("http://127.0.0.1:5502/index.html");
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByLabel("Email:").fill(supabaseEmail);
    await page.getByLabel("Password:").fill(supabasePasswordB);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/disclaimer.html");

    //   await expect(page.getByRole("heading", { name: "Bootcamp 15 Resources" })).toBeVisible();
    //   const workshop1Link = page.getByRole("link", { name: "Workshop 1 - Romeo and Juligit" });
    //   await expect(workshop1Link).toBeVisible();
    //   await workshop1Link.click();
    //   await page.waitForLoadState("load");
    //   let repoLink = page.getByRole("link", { name: "Github Repo" });
    //   await expect(repoLink).toBeVisible();
    //   const href = await repoLink.getAttribute("href");
    //   expect(href).toMatch("https://classroom.github.com/a/ElP3Fc9C");
    //   await expect(page).toHaveTitle(/.*/);
    //   await page.getByRole("textbox").fill("This is a new test comment");
    //   await page.getByRole("button", { name: "Post" }).click();
    //   await expect(page.getByRole("textbox")).toHaveValue("");
    //   await expect(page.getByText("This is a new test comment")).toBeVisible();

    //   await expect(page.getByRole("link"))
  });
});

test.describe("Tests with beforeEach login - not on 7 day program", async () => {
  test.beforeEach(async ({ page }) => {
    await resetdb(supabase, user);
    await login(page);
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/disclaimer.html");
  });

  test("Test 'done' button does not appear on calm breathing page if not in program", async ({ page }) => {
    await page.goto("http://127.0.0.1:5502/pages/menu.html");
    const menuHeading = await page.getByRole("heading", { name: "Welcome" });
    await expect(menuHeading).toHaveText("Welcome");
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/menu.html");

    // check user_details fields from database before going to calm breathing page
    let userDetails = await getUserDetails();
    await expect(userDetails.program_duration).toBe(0);
    await expect(userDetails.program_days_spent).toBe(0);
    await expect(userDetails.last_exercise_date).toBe(null);

    await page.getByRole("article").filter({ hasText: "Calm Breathing" }).click();
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");
    // check "done" button is not present
    await expect(page.getByRole("button", { hasText: "Done" })).not.toBeVisible;
    await expect(page).toHaveURL("http://127.0.0.1:5502/pages/calmBreathing.html");
  });
});




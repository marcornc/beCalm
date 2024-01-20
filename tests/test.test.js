// Import Vitest for testing
import { test, expect, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {nextPage} from "../scripts/nextPage.js"
import {resetdb} from "../database/scripts/resetdb.js";


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseEmail = process.env.SUPABASE_EMAIL;
const supabasePassword = process.env.SUPABASE_PASSWORD;

export const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase.auth.signInWithPassword({
    email: supabaseEmail,
    password: supabasePassword,
});
if (error ) throw new Error(`Error signing in to database: ${error}`)
const user = data.user;

beforeEach(async () => {
  await resetdb(supabase, user);
});

// Test for page flows with new user user_details settings
test("Page flows with new user user_details settings", async function () {
  // test next page when on index page
  const responseA = await nextPage(supabase, user, "index");
  expect(responseA).toBe("./pages/disclaimer.html");

  // test next page when on login page
  const responseB = await nextPage(supabase, user, "login");
  expect(responseB).toBe("./disclaimer.html");

  // test next page when on disclaimer page
  const responseC = await nextPage(supabase, user, "disclaimer");
  expect(responseC).toBe("./assess.html");

  // test next page when on assess page
  const responseD = await nextPage(supabase, user, "assess");
  expect(responseD).toBe("./goals.html");

  // test next page when on assess page
  const responseE = await nextPage(supabase, user, "goals");
  expect(responseE).toBe("./usage.html");

  // test next page when on assess page
  const responseF = await nextPage(supabase, user, "usage");
  expect(responseF).toBe("./menu.html");
});

// Test for page flows with suppress_disclaimer=true in user_details settings
test("Page flows with suppress_disclaimer=true in user_details settings", async function () {
  // update suppress_disclaimer to be true
  const { error } = await supabase.from("user_details").update({ suppress_disclaimer: true }).eq("user_id", user.id);
  if (error) {
    throw new Error(`Error updating record in suppress disclaimer: ${error.message}`);
  }

  // test next page when on index page
  const responseA = await nextPage(supabase, user, "index");
  expect(responseA).toBe("./pages/assess.html");

  // test next page when on login page
  const responseB = await nextPage(supabase, user, "login");
  expect(responseB).toBe("./assess.html");

  // test next page when on disclaimer page
  const responseC = await nextPage(supabase, user, "disclaimer");
  expect(responseC).toBe("./assess.html");
});

// Test for page flows with suppress_disclaimer=true and feedback_due=false in user_details settings
test("Page flows with suppress_disclaimer=true and feedback_due=false in user_details settings", async function () {
  // update suppress_disclaimer to be true and feedback_due to be false
  const { error } = await supabase.from("user_details").update({ suppress_disclaimer: true, feedback_due: false }).eq("user_id", user.id);
  if (error) {
    throw new Error(`Error updating record in suppress disclaimer and feedback_due = false: ${error.message}`);
  }

  // test next page when on index page
  const responseA = await nextPage(supabase, user, "index");
  expect(responseA).toBe("./pages/goals.html");

  // test next page when on login page
  const responseB = await nextPage(supabase, user, "login");
  expect(responseB).toBe("./goals.html");

  // test next page when on disclaimer page
  const responseC = await nextPage(supabase, user, "disclaimer");
  expect(responseC).toBe("./goals.html");
});

// Test for page flows with suppress_disclaimer=true, feedback_due=false and goals_due=falsein user_details settings
test("Page flows with suppress_disclaimer=true, feedback_due=false and goals_due=false in user_details settings", async function () {
  // update suppress_disclaimer to be true and feedback_due to be false
  const { error } = await supabase.from("user_details").update({ suppress_disclaimer: true, feedback_due: false, goals_due: false }).eq("user_id", user.id);
  if (error) {
    throw new Error(`Error updating record in suppress disclaimer, feedback_due = false and goals_due = false: ${error.message}`);
  }

  // test next page when on index page
  const responseA = await nextPage(supabase, user, "index");
  expect(responseA).toBe("./pages/usage.html");

  // test next page when on login page
  const responseB = await nextPage(supabase, user, "login");
  expect(responseB).toBe("./usage.html");

  // test next page when on disclaimer page
  const responseC = await nextPage(supabase, user, "disclaimer");
  expect(responseC).toBe("./usage.html");

  // test next page when on assess page
  const responseD = await nextPage(supabase, user, "assess");
  expect(responseD).toBe("./usage.html");
});

// Test for page flows with suppress_disclaimer=true, feedback_due=false, goals_due=false and usage_due=false in user_details settings
test("Page flows with suppress_disclaimer=true, feedback_due=false, goals_due=false and usage_due=false in user_details settings", async function () {
  // update suppress_disclaimer = true, feedback_due, goals_due and usage_due all = false
  const { error } = await supabase.from("user_details").update({ suppress_disclaimer: true, feedback_due: false, goals_due: false, usage_due: false }).eq("user_id", user.id);
  if (error) {
    throw new Error(`Error updating record in suppress disclaimer, feedback_due, goals_due and usage_due all = false: ${error.message}`);
  }

  // test next page when on index page
  const responseA = await nextPage(supabase, user, "index");
  expect(responseA).toBe("./pages/menu.html");

  // test next page when on login page
  const responseB = await nextPage(supabase, user, "login");
  expect(responseB).toBe("./menu.html");

  // test next page when on disclaimer page
  const responseC = await nextPage(supabase, user, "disclaimer");
  expect(responseC).toBe("./menu.html");

  // test next page when on assess page
  const responseD = await nextPage(supabase, user, "assess");
  expect(responseD).toBe("./menu.html");

  // test next page when on goals page
  const responseE = await nextPage(supabase, user, "goals");
  expect(responseE).toBe("./menu.html");
});









export async function nextPage(supabase, user, currentPage) {
  
  // object to define the sequence of pages from different starting pages
  const pages = {
    index: ["disclaimer", "assess", "goals", "usage", "menu"],
    login: ["disclaimer", "assess", "goals", "usage", "menu"],
    disclaimer: ["assess", "goals", "usage", "menu"],
    assess: ["goals", "usage", "menu"],
    goals: ["usage", "menu"],
    usage: ["menu"]
  };

  // object to define the functions which determine whether a particular page is due
  const pageCheck = {
    disclaimer: disclaimerDue,
    assess: assessDue,
    goals: goalsDue,
    usage: usageDue,
    menu: menuDue
  }

  // functions to return whether the pages are due
  function disclaimerDue(data) {
    if (!data.suppress_disclaimer) return true;
    return false;
  }

  function assessDue(data) {
    if (data.feedback_due) return true;
    return false
  }

  function goalsDue(data) {
    if (data.goals_due) return true;
    return false;
  }

  function usageDue(data) {
    if (data.usage_due) return true;
    return false;
  }

  function menuDue(data) {
    return true;
  }

  // function to determine which page is next
  async function getNextPage(data, currentPage) {
    // if no user record found, create it and return current page as next page
    if (data.length === 0) {
      const { error } = await supabase.from("user_details").insert({ user_id: user.id });
      if (currentPage === "login" && !error) return "./disclaimer.html";
      console.log(`No user details record found in ${currentPage}`);
      if (error) {
        console.log(`Error inserting user details record in ${currentPage}`);
      }
      return `./${currentPage}.html`
    }
    // go through each potential routing page and return the first one that is due
    const nextPages = pages[currentPage];
    for (let i = 0; i < nextPages.length; i++) {
      const pageCheckFunction = pageCheck[nextPages[i]];
      const pageDue = pageCheckFunction(data[0]);
      const routing = `./${currentPage === "index" ? "pages/" : ""}${nextPages[i]}.html`;
      if (pageDue) return `./${currentPage === "index" ? "pages/" : ""}${nextPages[i]}.html`;
    }
  }

  if (user) {
    const { data, error } = await supabase.from("user_details").select("*").eq("user_id", user.id);
    return await getNextPage(data, currentPage);
  }
  return `./login.html`
}

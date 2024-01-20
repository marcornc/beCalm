
# BeCalm

([See the Project](https://be-calm.vercel.app/))

## Authors
* [Doug Forbes](https://github.com/Dug-F)
* [Marco Ronchi](https://github.com/marcornc)
* [Tom Chappell](https://github.com/Tom-Chappell-Git)
* [Rajea Bilal](https://github.com/rajea-bilal)
* [Maria Araque Martos](https://github.com/maramar0414)
* [Ioan Simionescu](https://github.com/StolenMango)

## Description

The app has four main methods to help you relax and feel less anxious.

It's made to be easy to use without being confusing. It's simple and easy to understand, just like the techniques.

There's a seven-day plan already set up, and you can also practice on your own.


## Getting Started

* Run npm install to install the testing packages
    Vitest
    Playwright

    Plus dependencies
    Node version: 18.16 or higher

### Languages:
* HTML
* CSS
* JavaScript - ECMA Script 6 (ES6)

### Library
* [GSAP](https://gsap.com/docs/v3/) - JavaScript animation library
added via a CDN link in calmBreathing.html

### Frameworks
* [Vitest](https://vitest.dev/) - Unit testing
* [Playwright](https://playwright.dev/) - User testing


### Backend
* [Supabase](https://supabase.com/)
<!-- Question for coaches: How do we shift control of Supabase to Anthony? -->

* Scripts to create the database tables are listed in the database folder in the codebase

* ONCE THE DATABASE TABLES ARE BUILT IT'S CRITICALLY IMPORTANT FOR SECURITY TO ENABLE RLS AND SET THE POLICIES DESCRIBED IN THE SCRIPTS

* Row-level security is enabled on all tables.  Users can only access their data in user_details, user_progress and mandala_images

* Uploaded mandala images are held in Supabase storage as images and thumbnails and presented as temporary signed URLs on the webpage

* user_details table:<br>
user_id, suppress_disclaimer, feedback_due, program_duration, program_days_spent, last_exercise_date, goals_due, usage_due, goal_id, goal_description, goal_image

* user_progress table:<br>
user_id, survey_date, wellbeing, breathing, relax, express, visualise

* goals table:<br>
id, sequence, description, further_details

* mandala_images table:<br>
user_id, created_date, description, thumbnail_path, image_path

### Media
* Video hosting on YouTube - hosted by client
* Audio hosting on Soundcloud - hosted by client

### Hosting

* [Render](https://dashboard.render.com/)
<!-- Question for coaches: How do we shift control of deployment to Anthony? -->

### Installing

* run npm install to install Vitest and Playwright packages

### Executing program

* Using live server, as the project runs off of vanilla JavaScript

### Testing

* npm run test: run Vitest
* Playwright tests are run using the Playwright Test for VSCode extension

## File Structure

### database folder
* Scripts to build database tables and set security policies

### pages
* HTML pages for each page of the app
* Two inner folders for audio pages

### script
* JavaScript files for dom manipulation, access, login, logout, connecting to Supabase and routing between pages.
* Each JavaScript file is related to the HTML file of the same name.

### static
The static folder holds the image files.

### styles
* styles.css holds generic styles that are applied to all pages
* other specific styles are applied with CSS files with the name that matches the HTML file.

### main project folder
* index.html - Landing page

## Further Developments
* Porting the App to React (it would improve the ease of maintenance and future enhancement and likely improve performance)
* Restructure of 7-day programme
* Self-assessment after 7-day Programme
* User feedback journey - ability to show the user how their mood self-ratings have changed each day
* 5-minute timer for each technique page
* Functionality to allow users to upload their avatars
* Positive psychology: self-certified star or daily award that can be used for unlocks (! Re-word? !)
* User profile with a drop-down menu. (! Keep? !)
* The ability to take multiple 7 Day Programs (reset functionality)
* Calming background music for guided visualisation
* Track user's daily exercise
* Allow users to change their goals
* Automatically fade out breathing bubble after a while


## Help

* The below SQL query can be used to reset a user's page routing to its original state by entering it in the SQL editor in supabase.

UPDATE user_details
SET suppress_disclaimer=false, feedback_due=true, goals_due=true, usage_due=true , goal_id=null, goal_description=null, goal_image=null
FROM auth.users
WHERE auth.users.email = '(developers email here)' and user_details.user_id = auth.users.id


## License

For internal use only
<!-- Question for coaches? -->


## Acknowledgments

Thanks and credit to Siddhant Khare whose [Mandala Maker](https://github.com/Siddhant-K-code/Mandala-Maker) code was used as the basis for the Mandala drawing function

# beCalm

const express = require("express");
const legoData = require("./Modules/LegoSets.js"); // Importing the Lego data module
const path = require("path"); // Path module for resolving file paths
const authData = require("./Modules/auth-service.js"); // Importing the authentication service module
const clientSessions = require("client-sessions"); // Importing client-sessions for session management

const app = express();
const port = 3000;

// Middleware for parsing URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', __dirname + '/views'); // Setting up the views directory for rendering templates

// Serving static files from the "Public" directory
app.use(express.static(__dirname + '/Public')); 

app.set("view engine", "ejs"); // Setting EJS as the view engine

require("dotenv").config(); // Loading environment variables from a .env file
const { name } = require("ejs"); // Importing "name" from EJS (this may not be necessary unless used somewhere else)
const Sequelize = require("sequelize"); // Importing Sequelize for database connection

require('pg'); // Explicitly requiring PostgreSQL module
const sequelize = new Sequelize(
  process.env.PGDATABASE, // Database name from environment variables
  process.env.PGUSER,     // Database username from environment variables
  process.env.PGPASSWORD, // Database password from environment variables
  {
    host: process.env.PGHOST, // Database host (usually localhost or cloud host)
    dialect: "postgres",      // Specifying PostgreSQL as the dialect
    port: 5432,               // Default PostgreSQL port
    dialectOptions: {
      ssl: { rejectUnauthorized: false }, // SSL options for secure database connection
    },
  }
);

// Middleware function to ensure a user is logged in before proceeding
function ensureLogin(req, res, next) {
  if (!req.session) { // If no session is found, redirect to login
    res.redirect("/login");
  } else {
    next(); // If session exists, proceed to the next middleware/route handler
  }
}

// Configuring client-side session handling
app.use(
  clientSessions({
    cookieName: "session", // Name of the session cookie
    secret: process.env.SESSION_SECRET, // Secret for encrypting session data
    duration: 15 * 60 * 1000, // Session expiration duration (15 minutes)
    activeDuration: 1000 * 60, // Extend session by 1 minute if user is active
  })
);

// Middleware to make session data available in the view templates
app.use((req, res, next) => {
  res.locals.session = req.session; // Assign session data to locals for easy access in templates
  next(); // Proceed to the next middleware/route handler
});

// Initialize Lego data, then define routes if successful
legoData
  .initialize()
  .then(() => {
    console.log("Lego data initialized.");

    // Root route (Home page)
    app.get("/", (req, res) => {
      res.render("home"); // Render the "home" view template
    });

    // About page route
    app.get("/about", (req, res) => {
      res.render("about"); // Render the "about" view template
    });

    // Route to get Lego sets by theme or all sets
    app.get("/lego/sets", (req, res) => {
      const theme = req.query.theme; // Extract the theme from the query parameter
      if (theme) { // If a theme is provided, fetch sets by theme
        legoData
          .getSetsByTheme(theme)
          .then((sets) => {
            if (sets.length > 0) {
              res.render("sets", { sets: sets, theme: theme }); // Render sets view if sets are found
            } else {
              res.status(404).render("404", {
                message: "There's No Sets found " + theme, // Render 404 view if no sets found
              });
            }
          })
          .catch((error) => {
            console.error(error); // Log any error in fetching sets
            res.status(404).render("404", {
              message: "Unable to find Sets for a matching theme ", // Render 404 if there's an error
            });
          });
      } else { // If no theme is provided, fetch all sets
        legoData
          .getAllSets()
          .then((sets) => {
            res.render("sets", {
              sets: sets, // Pass all sets to the template
              page: "/lego/sets", // Pass the current page for navigation highlighting
              theme: theme || null, // Pass the theme if available, else null
            });
          })
          .catch((error) => {
            console.error(error); // Log error if fetching all sets fails
            res.status(404).render("404", {
              message: "An error occurred while fetching all sets.", // Render 404 view on error
            });
          });
      }
    });

    // Route to get Lego set by its number
    app.get("/lego/sets/:setNum", (req, res) => {
      const setNum = req.params.setNum; // Extract set number from the URL
      legoData
        .getSetByNum(setNum) // Fetch set by its number
        .then((set) => {
          if (set) {
            res.render("set", { set: set }); // Render set view if set is found
          } else {
            res.status(404).render("404", { message: " there's no set " + setNum }); // Render 404 if set not found
          }
        })
        .catch((error) => {
          console.error(error); // Log error if fetching set fails
          res.status(404).render("404", {
            message: "Unable to find sets with the specific set number", // Render 404 on error
          });
        });
    });

    // Custom 404 error handler (this should be the last route)
    app.use((req, res) => {
      res.status(404).render("404", {
        message: "I'm sorry, we're unable to find what you're looking for", // Render custom 404 view
      });
    });
  })
  .catch((error) => {
    console.error("Failed to initialize lego data:", error); // Log error if data initialization fails
  });

// Assignment 5 routes

// Route to display the Add Set form (requires login)
app.get("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    const themes = await legoData.getAllThemes(); // Fetch all themes for the dropdown
    res.render("addSet", { themes }); // Render the addSet view with the themes data
  } catch (err) {
    console.error(err); // Log error if fetching themes fails
    res.render("500", { message: "Unable to load the Add Set page." }); // Render 500 error if something goes wrong
  }
});

// Route to handle form submission for adding a set
app.post("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    await legoData.addSet(req.body); // Add the set using the form data
    res.redirect("/lego/sets"); // Redirect to the sets page after adding
  } catch (err) {
    console.error(err); // Log any errors that occur
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`, // Render 500 view on error
    });
  }
});

// Route to display edit page for a set (requires login)
app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.num); // Fetch the set to edit
    const themes = await legoData.getAllThemes(); // Fetch themes for dropdown
    res.render("editSet", { set, themes }); // Render the editSet view
  } catch (err) {
    console.error(err); // Log error if fetching set/themes fails
    res.status(404).render("404", { message: "Set not found." }); // Render 404 view if set not found
  }
});

// Route to handle form submission for editing a set
app.post("/lego/editSet/:num", ensureLogin, async (req, res) => {
  try {
    await legoData.editSet(req.params.num, req.body); // Edit the set using form data
    res.redirect("/lego/sets"); // Redirect to the sets page after editing
  } catch (err) {
    console.error(err); // Log error if editing fails
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`, // Render 500 view on error
    });
  }
});

// Route to delete a set (requires login)
app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num); // Delete the set by its number
    res.redirect("/lego/sets"); // Redirect to the sets page after deletion
  } catch (err) {
    console.error(err); // Log error if deletion fails
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`, // Render 500 view on error
    });
  }
});

// Assignment 6: User Authentication

authData
  .initialize() // Initialize authentication data
  .then(() => {
    console.log("Authentication data initialized.");

    // Route for rendering the register view
    app.get("/register", (req, res) => {
      res.render("register", { errorMessage: null, successMessage: null }); // Render the register page
    });

    // Route to handle user registration
    app.post("/register", async (req, res) => {
      const { userName, email, password } = req.body; // Extract registration details
      try {
        const newUser = await authData.registerUser(req.body); // Register the new user
        res.render("register", {
          successMessage: "User created", // Show success message if registration succeeds
          errorMessage: null,
        });
      } catch (err) {
        console.error(err); // Log error if registration fails
        res.render("register", {
          errorMessage: err, // Show error message if registration fails
          userName,
          successMessage: null,
        });
      }
    });

    // Route for rendering the login view
    app.get("/login", (req, res) => {
      res.render("login", { errorMessage: null }); // Render the login page
    });

    // Route to handle user login
    app.post("/login", async (req, res) => {
      req.body.userAgent = req.get("User-Agent"); // Set User-Agent in request body for login history
      try {
        const user = await authData.checkUser(req.body); // Authenticate the user
        if (user) {
          // Store user details in session if authenticated
          req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory,
          };
          res.redirect("/lego/sets"); // Redirect to the sets page after login
        } else {
          res.render("login", {
            errorMessage: "Invalid username or password", // Show error message if login fails
          });
        }
      } catch (err) {
        res.render("login", { errorMessage: err }); // Render login page with error message on error
      }
    });

    // Route to handle user logout
    app.get("/logout", (req, res) => {
      req.session.reset(); // Clear session on logout
      res.redirect("/"); // Redirect to home page after logout
    });

    // Route for displaying user login history (requires login)
    app.get("/userHistory", ensureLogin, (req, res) => {
      res.render("userHistory"); // Render the user history page
    });

    // Start the server on the specified port
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize authentication data:", error); // Log error if authentication initialization fails
  });

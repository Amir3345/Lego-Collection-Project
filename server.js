/*********************************************************************************
 * WEB322 – Assignment 02
 * I declare that this assignment is my own work in accordance with Seneca College's
 * Academic Integrity Policy.
 *
 * Name: Amir Hossein Behzad
 * Student ID: 144725223
 * Date: 2/2/2024
 *
 * Published URL: https://different-jade-abalone.cyclic.app
 *********************************************************************************/
const express = require("express");
const legoData = require("./Modules/LegoSets.js");
const path = require("path");
const authData = require("./Modules/auth-service.js");
const clientSessions = require("client-sessions");

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', __dirname + '/views');
//app.use(express.static("Public"));
app.use(express.static(__dirname + '/public')); 
//app.set("view engine", "ejs");

require("dotenv").config();
const { name } = require("ejs");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

function ensureLogin(req, res, next) {
  if (!req.session) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.use(
  clientSessions({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    duration: 15 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

legoData
  .initialize()
  .then(() => {
    console.log("Lego data initialized.");

    // Root route
    app.get("/", (req, res) => {
      res.render("home");
    });

    // About route
    app.get("/about", (req, res) => {
      res.render("about");
    });

    // Route to get a Lego set by Theme
    app.get("/lego/sets", (req, res) => {
      const theme = req.query.theme;
      if (theme) {
        legoData
          .getSetsByTheme(theme)
          .then((sets) => {
            if (sets.length > 0) {
              res.render("sets", { sets: sets, theme: theme });
            } else {
              res.status(404).render("404", {
                message: "There's No Sets found " + theme,
              });
            }
          })
          .catch((error) => {
            console.error(error);
            res.status(404).render("404", {
              message: "Unable to find Sets for a matching theme ",
            });
          });
      } else {
        legoData
          .getAllSets()
          .then((sets) => {
            res.render("sets", {
              sets: sets,
              page: "/lego/sets",
              theme: theme || null,
            });
          })
          .catch((error) => {
            console.error(error);
            res.status(404).render("404", {
              message: "An error occurred while fetching all sets.",
            });
          });
      }
    });

    // Route to get a Lego set by number
    app.get("/lego/sets/:setNum", (req, res) => {
      const setNum = req.params.setNum;
      legoData
        .getSetByNum(setNum)
        .then((set) => {
          if (set) {
            res.render("set", { set: set });
          } else {
            res
              .status(404)
              .render("404", { message: " theres no set " + setNum });
          }
        })
        .catch((error) => {
          console.error(error);

          res.status(404).render("404", {
            message: "Unable to find sets with the specific set number",
          });
        });
    });

    // Custom 404 error page
    app.use((req, res) => {
      res.status(404).render("404", {
        message: "I'm sorry, we're unable to find what you're looking for",
      });
    });
  })
  .catch((error) => {
    console.error("Failed to initialize lego data:", error);
  });

//Assigment 5
//route to open addset page
app.get("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes });
  } catch (err) {
    console.error(err);
    res.render("500", { message: "Unable to load the Add Set page." });
  }
});

// route to post form addset to the database
app.post("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    console.error(err);
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

//route to open edit page
app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.num);
    const themes = await legoData.getAllThemes();
    res.render("editSet", { set, themes });
  } catch (err) {
    console.error(err);
    res.status(404).render("404", { message: "Set not found." });
  }
});

// route to post form of the edited set to the database
app.post("/lego/editSet/:num", ensureLogin, async (req, res) => {
  try {
    await legoData.editSet(req.params.num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    console.error(err);
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

//route to Delete a set
app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    console.error(err);
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

//Assigment 6
authData
  .initialize()
  .then(() => {
    console.log("Authentication data initialized.");

    // Route for rendering the register view
    app.get("/register", (req, res) => {
      res.render("register", { errorMessage: null, successMessage: null });
    });

    // Route for handling user registration
    app.post("/register", async (req, res) => {
      const { userName, email, password } = req.body;
      try {
        const newUser = await authData.registerUser(req.body);
        res.render("register", {
          successMessage: "User created",
          errorMessage: null,
        });
      } catch (err) {
        console.error(err);
        res.render("register", {
          errorMessage: err,
          userName,
          successMessage: null,
        });
      }
    });

    // Route for rendering the login view
    app.get("/login", (req, res) => {
      res.render("login", { errorMessage: null });
    });

    // Route for handling login
    app.post("/login", async (req, res) => {
      // Set User-Agent in request body
      req.body.userAgent = req.get("User-Agent");
      try {
        const user = await authData.checkUser(req.body);
        if (user) {
          // Add user details to session
          req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory,
          };
          res.redirect("/lego/sets");
        } else {
          res.render("login", {
            errorMessage: "Invalid username or password",
          });
        }
      } catch (err) {
        res.render("login", { errorMessage: err });
      }
    });

    // Route for logging out
    app.get("/logout", (req, res) => {
      req.session.reset();
      res.redirect("/");
    });

    // Route for user history
    app.get("/userHistory", ensureLogin, (req, res) => {
      res.render("userHistory");
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize authentication data:", error);
  });



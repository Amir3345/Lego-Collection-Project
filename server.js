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
const express = require('express');
const legoData = require('./Modules/LegoSets.js'); 
const path = require('path');


const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('Public'));
app.set('view engine', 'ejs');

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


legoData.initialize().then(() => {
  console.log('Lego data initialized.');

  // Root route
  app.get('/', (req, res) => {
    res.render('home');
  });

  // About route
  app.get('/about', (req, res) => {
    res.render('about');
  });

  app.get('/lego/sets', (req, res) => {
    const theme = req.query.theme;
    if (theme) {
      legoData.getSetsByTheme(theme).then((sets) => {
        if (sets.length > 0) { 
          res.render('sets', { sets: sets , theme: theme}); 
        } else {
          res.status(404).render('404', { message: "There's No Sets found " + theme });
        }
      }).catch((error) => {
        console.error(error); 
        res.status(404).render('404', { message: "Unable to find Sets for a matching theme " });
      });
    } else {
      legoData.getAllSets().then((sets) => {
        res.render('sets', { sets: sets, page: '/lego/sets', theme: theme || null });
      }).catch((error) => {
        console.error(error); 
        res.status(404).render('404', { message: "An error occurred while fetching all sets." });
      });
    }
  });
  


// Route to get a Lego set by number
app.get('/lego/sets/:setNum', (req, res) => {
  const setNum = req.params.setNum;
  legoData.getSetByNum(setNum).then((set) => {
    if(set) {
      res.render('set', { set: set });
    } else {

      res.status(404).render('404', { message: " theres no set " + setNum });
    }
  }).catch((error) => {
    console.error(error); 
    
    res.status(404).render('404', { message: "Unable to find sets with the specific set number" });
  });
});



  // Custom 404 error page
  app.use((req, res) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"})
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

}).catch((error) => {
  console.error('Failed to initialize lego data:', error);
});



//Assigment 5


//route to open addset page
app.get('/lego/addSet', async (req, res) => {
  try {
    const themes = await legoData.getAllThemes(); 
    res.render('addSet', { themes });
  } catch (err) {
    console.error(err);
    res.render('500', { message: "Unable to load the Add Set page." });
  }
}); 

// route to post form addset to the database
app.post('/lego/addSet', async (req, res) => {
  try {
    
    await legoData.addSet(req.body); 
    res.redirect('/lego/sets'); 
  } catch (err) {
    console.error(err);
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

//route to open edit page
app.get('/lego/editSet/:num', async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.num);
    const themes = await legoData.getAllThemes();
    res.render('editSet', { set, themes });
  } catch (err) {
    console.error(err);
    res.status(404).render('404', { message: "Set not found." });
  }
});

// route to post form of the edited set to the database
app.post('/lego/editSet/:num', async (req, res) => {
  try {
    await legoData.editSet(req.params.num, req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    console.error(err);
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

//route to Delete a set
app.get('/lego/deleteSet/:num', async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect('/lego/sets');
  } catch (err) {
    console.error(err);
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});
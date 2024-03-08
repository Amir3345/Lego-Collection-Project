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

app.use(express.static('Public'));
app.set('view engine', 'ejs');

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
        if (sets.length > 0) { // Check if any sets were found
          res.render('sets', { sets: sets , theme: theme}); // Pass the sets data to the EJS view
        } else {
          res.status(404).render('404', { message: "There's No Sets found " + theme });
        }
      }).catch((error) => {
        console.error(error); // Log the error for debugging
        res.status(404).render('404', { message: "Unable to find Sets for a matching theme " });
      });
    } else {
      legoData.getAllSets().then((sets) => {
        res.render('sets', { sets: sets, page: '/lego/sets', theme: theme || null });
      }).catch((error) => {
        console.error(error); // Log the error for debugging
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




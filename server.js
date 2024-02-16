/*********************************************************************************
 * WEB322 – Assignment 02
 * I declare that this assignment is my own work in accordance with Seneca College's
 * Academic Integrity Policy.
 * 
 * Name: Amir Hossein Behzad
 * Student ID: 144725223
 * Date: 2/2/2024
 *  
 * Published URL: [Your Published URL Here]
 *********************************************************************************/
const express = require('express');
const legoData = require('./Modules/LegoSets.js'); 
const path = require('path');


const app = express();
const port = 3000;

app.use(express.static('Public'));

legoData.initialize().then(() => {
  console.log('Lego data initialized.');

  // Root route
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
  });

  // About route
  app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
  });

 // Route to get all Lego sets or filter by theme
app.get('/lego/sets', (req, res) => {
  const theme = req.query.theme;
  if (theme) {
    legoData.getSetsByTheme(theme).then((sets) => {
      if (sets.length > 0) { // Check if any sets were found
        res.json(sets);
      }
        }).catch((error) => {
          console.error(error); // Log the error for debugging
          res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
        }); 
  } else {
    legoData.getAllSets().then((sets) => {
      res.json(sets);
    }).catch((error) => {
      console.error(error); // Log the error for debugging
      res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    });
  }
});


  // Route to get a Lego set by number
  app.get('/lego/sets/:setNum', (req, res) => {
    const setNum = req.params.setNum;
    legoData.getSetByNum(setNum).then((set) => {
      res.json(set);
    }).catch((error) => {
      res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    });
  });

  // Custom 404 error page
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

}).catch((error) => {
  console.error('Failed to initialize lego data:', error);
});

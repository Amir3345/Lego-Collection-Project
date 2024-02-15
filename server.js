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

  app.use(express.static('Public'))

  legoData.initialize().then(() => {
    console.log('Lego data initialized.');
    
    // Root route
    app.get('/', (req, res) => {
      
      res.sendFile(path.join(__dirname, '/views/home.html'));
    });

    app.get('/about', (req, res) => {
      
      res.sendFile(path.join(__dirname, '/views/about.html'));
    });


    // Route to get all Lego sets
    app.get('/lego/sets', (req, res) => {
      legoData.getAllSets().then((sets) => {
        res.json(sets);
      }).catch((error) => {
        res.status(500).send(error.message);
      });
    });

    // Route to demonstrate getting a Lego set by number
    app.get('/lego/sets/num-demo', (req, res) => {
      
      legoData.getSetByNum('001-1').then((set) => {
        res.json(set);
      }).catch((error) => {
        res.status(404).send(error.message);
      });
    });

    // Route to demonstrate getting Lego sets by theme
    app.get('/lego/sets/theme-demo', (req, res) => {
    
      legoData.getSetsByTheme('tech').then((sets) => {
        res.json(sets);
      }).catch((error) => {
        res.status(404).send(error.message);
      });
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  }).catch((error) => {
    console.error('Failed to initialize lego data:', error);
  });

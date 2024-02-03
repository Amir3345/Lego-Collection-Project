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

const express = require("express");
const legoData = require("./modules/legoSets");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Assignment 2: Your Name - Your Student Id");
});

app.get("/lego/sets", async (req, res) => {
  try {
    await legoData.initialize();
    const allSets = await legoData.getAllSets();
    res.json(allSets);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/lego/sets/num-demo", async (req, res) => {
  try {
    await legoData.initialize();
    const specificSet = await legoData.getSetByNum("001-1");
    res.json(specificSet);
  } catch (error) {
    res.status(404).send(error);
  }
});

app.get("/lego/sets/theme-demo", async (req, res) => {
  try {
    await legoData.initialize();
    const setsByTheme = await legoData.getSetsByTheme("tech");
    res.json(setsByTheme);
  } catch (error) {
    res.status(404).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

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
// Import the set and theme data from the JSON files
const setData = require("../data/setData");
const themeData = require("../data/themeData");

// Initialize an array to hold the combined set data
let sets = [];

// Function to initialize the sets array with combined data
function initialize() {
  return new Promise((resolve, reject) => {
    try {
      // Map through each set and find its theme
      sets = setData.map((set) => {
        const theme = themeData.find((theme) => theme.id === set.theme_id)?.name || "Unknown Theme";
        // Return a new object with set data and theme name
        return { ...set, theme };
      });
      resolve();
    } catch (error) {
      // Reject the promise if there's an error
      reject(error.message);
    }
  });
}

// Function to retrieve all sets
function getAllSets() {
  return new Promise((resolve) => {
    resolve(sets);
  });
}

// Function to find a set by its number
function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    const foundSet = sets.find((set) => set.set_num === setNum);
    if (foundSet) {
      resolve(foundSet);
    } else {
      reject(`Set number ${setNum} not located in the database.`);
    }
  });
}

// Function to get sets by their theme, accepting partial matches
function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    const matchingSets = sets.filter((set) => 
      set.theme.toLowerCase().includes(theme.toLowerCase())
    );
    if (matchingSets.length > 0) {
      resolve(matchingSets);
    } else {
      reject(`No sets found under the theme: ${theme}`);
    }
  });
}

// Exports the functions to be used in other modules
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };

// Self-testing the module functions
async function testLegoSets() {
  try {
    // Test the initialization of set data
    await initialize();
    // Test retrieving all sets
    const allSets = await getAllSets();
    console.log("Catalog of All Sets:", allSets);

    // Test finding a specific set
    const specificSet = await getSetByNum("001-1");
    console.log("Details of Specific Set:", specificSet);

    // Test getting sets by a theme keyword
    const setsByTheme = await getSetsByTheme("tech");
    console.log("List of Sets by Theme:", setsByTheme);
  } catch (error) {
    console.error("Test Error:", error);
  }
}

// Invoke the test function
testLegoSets();

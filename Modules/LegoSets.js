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




// // Import the set and theme data from the JSON files
// const setData = require("../data/setData");
// const themeData = require("../data/themeData");




require("dotenv").config();
const { name } = require("ejs");
const Sequelize = require("sequelize"); 
const { Op } = require('sequelize');  



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


const Theme = sequelize.define(
  'Theme',
  {
   
    id : { type: Sequelize.INTEGER , primaryKey:true, autoincrement:true},
    name: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false, 
  }
);


const Set = sequelize.define(
  'Set',
  {
    set_num:{ type: Sequelize.STRING , primaryKey:true},
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,   
  },
  {
    createdAt: false,
    updatedAt: false, 
  }
);



Set.belongsTo(Theme, {foreignKey: 'theme_id'})

// // Code Snippet to insert existing data from Set / Themes

// sequelize 
//   .sync()
//   .then( async () => {
//     try{
//       await Theme.bulkCreate(themeData);
//       await Set.bulkCreate(setData); 
//       console.log("-----");
//       console.log("data inserted successfully");
//     }catch(err){
//       console.log("-----");
//       console.log(err.message);

//       // NOTE: If you receive the error:

//       // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"

//       // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".   

//       // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
//     }

//     process.exit();
//   })
//   .catch((err) => {
//     console.log('Unable to connect to the database:', err);
//   });




// // Initialize an array to hold the combined set data
// let sets = [];

// Function to initialize the sets array with combined data
function initialize() {
  return sequelize.sync().then(() => {
    console.log('Database synced');
  }).catch((err) => {
    console.error('Failed to sync database: ', err);
    throw err;
  });
}

// Function to retrieve all sets
function getAllSets() {
  return Set.findAll({
    include: [Theme]
  });
}

// Function to find a set by its number
function getSetByNum(setNum) {
  return Set.findOne({
    where: { set_num: setNum },
    include: [Theme]
  }).then(set => {
    if (!set) {
      throw `Set number ${setNum} not located in the database.`;
    }
    return set;
  });
}

// Function to get sets by their theme, accepting partial matches
function getSetsByTheme(theme) {
  return Set.findAll({
    include: [{
      model: Theme,
      where: {
        name: {
          [Op.iLike]: `%${theme}%`
        }
      }
    }]
  }).then(sets => {
    if (sets.length === 0) {
      throw `No sets found under the theme: ${theme}`;
    }
    return sets;
  });
}


async function getAllThemes() {
  try {
    return await Theme.findAll();
  } catch (err) {
    console.error('Error fetching themes:', err);
    throw err; 
  }
}

async function addSet(setData) {
  try {
    const newSet = await Set.create({
      set_num: setData.set_num,
      name: setData.name,
      year: setData.year,
      num_parts: setData.num_parts,
      theme_id: setData.theme_id,
      img_url: setData.img_url,
    });
    return newSet;
  } catch (err) {
    console.error('Error adding new set:', err);
    throw err;
  }
}
async function editSet(set_num, setData) {
  try {
    const result = await Set.update(setData, {
      where: { set_num: set_num }
    });

    // Check if any rows were updated
    if (result[0] === 0) {
      throw new Error('Set not found or data unchanged');
    }
  } catch (err) {
    console.error('Error updating set:', err);
    throw err;
  }
}

async function deleteSet(set_num) {
  try {
    const result = await Set.destroy({
      where: { set_num: set_num }
    });

  } catch (err) {
    console.error('Error deleting set:', err);

  }
}


// Exports to server or other
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme , getAllThemes, addSet, editSet, deleteSet};


// Self-testing the module functions
async function testLegoSets() {
  try {
   
    await initialize();
  
    const allSets = await getAllSets();
    console.log("Catalog of All Sets:", allSets);

    const specificSet = await getSetByNum("001-1");
    console.log("Details of Specific Set:", specificSet);


    const setsByTheme = await getSetsByTheme("tech");
    console.log("List of Sets by Theme:", setsByTheme);
  } catch (error) {
    console.error("Test Error:", error);
  }
}

// Invoke the test function
testLegoSets();





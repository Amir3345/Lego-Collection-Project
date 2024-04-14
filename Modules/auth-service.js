const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  loginHistory: [
    {
      dateTime: {
        type: Date,
      },
      userAgent: {
        type: String,
      },
    },
  ],
});
const User = mongoose.model("User", userSchema);

function initialize() {
  return new Promise(function (resolve, reject) {
    mongoose.connect(process.env.mongoose);
    const db = mongoose.connection;
    db.on("error", (err) => {
      reject(err);
    });
    db.once("open", () => {
      resolve();
    });
  });
}

// Register user function
function registerUser(userData) {
  return new Promise(function (resolve, reject) {
    // Check if passwords match
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
      return; // Stop execution
    }

    // Encrypt the password
    bcrypt
      .hash(userData.password, 10)
      .then((hashPassword) => {
        User.findOne({ userName: userData.userName })
          .then((existingUser) => {
            if (existingUser) {
              reject("User Name already taken");
            } else {
              // Create a new user with specific field names
              const newUser = new User({
                userName: userData.userName,
                email: userData.email,
                password: hashPassword,
              });

              newUser
                .save()
                .then(() => resolve())
                .catch((err) => {
                  reject("There was an error creating the user: " + err);
                });
            }
          })
          .catch((err) => reject("Error checking user existence: " + err));
      })
      .catch((err) => reject("There was an error encrypting the password"));
  });
}

function checkUser(userData) {
  return new Promise(function (resolve, reject) {
    const User = mongoose.model("User", userSchema);
    User.findOne({ userName: userData.userName })
      .then((user) => {
        if (!user) {
          reject(new Error("Incorrect Username or Password"));
          return; // Stop execution
        }

        // Compare passwords
        bcrypt
          .compare(userData.password, user.password)
          .then((result) => {
            if (result) {
              // Passwords match, update login history
              if (user.loginHistory.length === 8) {
                user.loginHistory.pop();
              }
              user.loginHistory.unshift({
                dateTime: new Date().toString(),
                userAgent: userData.userAgent,
              });

              User.updateOne(
                { userName: user.userName },
                { $set: { loginHistory: user.loginHistory } }
              )
                .then(() => resolve(user))
                .catch((err) =>
                  reject(new Error("Error updating login history: " + err))
                );
            }
          })
          .catch((err) =>
            reject(new Error("Error comparing passwords: " + err))
          );
      })
      .catch(() => reject(new Error("Incorrect Username or Password")));
  });
}

module.exports = { initialize, registerUser, checkUser };

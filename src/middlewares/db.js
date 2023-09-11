const knex = require("knex");
const express = require("express");
const app = express();
const port = 9001;

const passwordOptions = ["macmac", "philfida", "1234", "philfilda"]; // Define your password options
let db = null; // Initialize the database connection variable

async function connectToDatabase() {
  for (const password of passwordOptions) {
    try {
      db = knex({
        client: "mysql2",
        connection: {
          host: "127.0.0.1",
          port: 3306,
          user: "root",
          password: password,
          database: "earth",
        },
        pool: {
          min: 2, // Minimum number of connections
          max: 100, // Maximum number of connections
        },
      });
      console.log(`Trying password: '${password}'`);
      await db.raw("SELECT 1"); // Test the database connection

      // If the connection is successful, break out of the loop
      break;
    } catch (error) {
      console.error(
        `Connection attempt with password '${password}' failed:`,
        error
      );
      db = null; // Reset the database connection variable
    }
  }

  if (!db) {
    console.error(
      "All connection attempts failed. Could not connect to the database."
    );
  }
}

connectToDatabase();

// Middleware to attach the database connection to the request object
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Export the database middleware for use in other parts of your application
module.exports = (req, res, next) => {
  req.db = db;
  next();
};

// Define your routes and route handlers here
app.get("/", (req, res) => {
  const db = req.db; // Access the database connection
  // Your route logic here
  res.send("Hello, World!");
});

// Start the Express.js server
app.listen(port, () => {
  console.log(`Back-end API listening on port ${port}`);
});

// const knex = require("knex")({
//   client: "mysql2",
//   connection: {
//     host: "127.0.0.1",
//     port: 3306,
//     user: "root",
//     password: "macmac",
//     // password: "macmac",
//     // password: "philfilda",
//     // password: "philfida",
//     // password: "macmac",
//     database: "earth",
//   },
//   pool: {
//     min: 2, // Minimum number of connections
//     max: 100, // Maximum number of connections
//   },
// });

// const db = (req, res, next) => {
//   req.db = knex;
//   next();
// };

// module.exports = db;

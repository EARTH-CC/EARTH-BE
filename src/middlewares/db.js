const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "1234",

    // password: "philfida",
    // password: "macmac",
    database: "earth",
  },
  pool: {
    min: 2, // Minimum number of connections
    max: 100, // Maximum number of connections
  },
});

const db = (req, res, next) => {
  req.db = knex;
  next();
};

module.exports = db;

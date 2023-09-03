const db = (req, res, next) => {
  const knex = require("knex")({
    client: "mysql2",
    connection: {
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "philfida",
      // password: "1234",
      // password: "macmac",
      // password : 'philfilda',
      // password : 'macmac',
      database: "earth",
    },
  });
  req.db = knex;
  next();
};

module.exports = db;

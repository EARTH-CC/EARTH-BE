const db = require("./db");
const asyncHandler = require("express-async-handler");

const userDao =
  (db,
  asyncHandler(async (req, res, next) => {
    const hasTable = async () => {
      try {
        await req.db.raw("SELECT * FROM users LIMIT 1");
        return true;
      } catch (error) {
        return false;
      }
    };

    const createTable = async () => {
      try {
        await req.db.schema
          .createTable("users", async (table) => {
            table.increments("uuid").primary();
            table.string("username").notNullable().unique();
            table.string("password").notNullable();
            table.string("firstname").notNullable();
            table.string("lastname").notNullable();
            table.string("region").nullable();
            table.string("role").notNullable();
            table.string("refresh_token").nullable();
            table.integer("status").notNullable().defaultTo(1);
          })
          .createTable("nursery", (table) => {
            table.increments("uuid").primary();
            table.date("report_date").notNullable();
            table.string("nurseries").notNullable();
            table.string("funded_by").notNullable();
            table.string("region").notNullable();
            table.string("province").notNullable();
            table.string("district").nullable();
            table.string("municipality").notNullable();
            table.string("barangay").notNullable();
            table.date("birthdate").notNullable();
            table.integer("age").notNullable();
            table.string("name_of_cooperative_individual").notNullable();
            table.string("gender").notNullable();
            table.date("date_established").notNullable();
            table.double("area_in_hectares_ha").notNullable();
            table.string("variety_used").notNullable();
            table.integer("period_of_moa").notNullable();
            table.string("remarks").nullable();
            table.timestamps(true, true);
            table
              .integer("added_by")
              .unsigned()
              .notNullable()
              .references("uuid")
              .inTable("users")
              .onDelete("RESTRICT");
          })

          .createTable("projects", (table) => {
            table.increments("uuid").primary();
            table.date("start_date").notNullable();
            table.date("end_date").notNullable();
            table.string("project_name").notNullable();
            table.double("cost").notNullable();
            table.timestamps(true, true);
            table
              .integer("added_by")
              .unsigned()
              .notNullable()
              .references("uuid") // Change this to "uuid" to match the primary key of "users" table
              .inTable("users")
              .onDelete("CASCADE");
          })

          .createTable("logs", (table) => {
            table.increments("log_id").primary();
            table
              .integer("user_id")
              .unsigned()
              .references("uuid")
              .inTable("users")
              .onDelete("RESTRICT");
            table
              .enu("module", [
                "Authentication",
                "Nursery",
                "Distribution",
                "PM Survived",
                "Expansion and Rehabilitation",
                "Cotton",
                "Cocoon",
                "Training",
                "Iec Material",
                "Expansion Under Coconut Project",
                "Abaca Disease Management Project",
                "Job Positions",
                "Projects",
              ])
              .notNullable();
            table.string("action").notNullable();
            table.json("data").nullable();
            table.string("ip_address").nullable();
            table.string("operating_system").nullable();
            table.string("session_id").nullable();
            table.text("user_agent").nullable();
            table.timestamps(true, true);
          });

        await req.db("users").insert([
          {
            username: "eglogistics",
            password:
              "$2b$10$.xSEIGgAGOv1NWMMQ1KSuev1/ccWK5sGiNu/5wGRQ5wBDEq8Mv86K",
            firstname: "Mark",
            lastname: "Salem",
            // region: "all",
            role: "superadmin",
          },
          {
            username: "hr",
            password:
              "$2b$10$ZEvsCQvjjbfkD.Zmwac/AegakD9cDVknJPTK5onPl/STsXtaKxYFG",
            firstname: "PhilFIDA",
            lastname: "PhilFIDA",
            // region: "all",
            role: "hradmin",
          },
          {
            username: "pictu",
            password:
              "$2b$10$Kwfe69CG8eom.ueyw4DM3.1SxWwJsY8k7dpE53rhL8Txpq3hDprye",
            firstname: "PhilFIDA",
            lastname: "PhilFIDA",
            // region: "all",
            role: "pictu",
          },
        ]);
      } catch (error) {
        console.error("Error creating user tables:", error);
        throw new Error("Error creating user tables");
      }
    };

    const main = async () => {
      try {
        if (!(await hasTable())) {
          await createTable();
        }
        req.userDao = userDao;
        next();
      } catch (error) {
        console.error("Error creating user tables:", error);
        return res.status(500).send({ error: "Error creating user tables" });
      }
    };

    main();
  }));

module.exports = userDao;

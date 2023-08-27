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

          .createTable("purchase_items", (table) => {
            table.increments("uuid").primary();
            table.string("item_name").notNullable();
            table.string("item_code").notNullable();
            table.string("category").notNullable();
            table.string("item_type").notNullable();
            table.string("description").notNullable();
            table.timestamps(true, true);
            table
              .integer("added_by")
              .unsigned()
              .notNullable()
              .references("uuid") // Change this to "uuid" to match the primary key of "users" table
              .inTable("users")
              .onDelete("CASCADE");

            table.index("item_name");
            table.index("item_code");
            table.index("item_type");
            table.index("description");
          })

          .createTable("supplier", (table) => {
            table.increments("uuid").primary();
            table.string("company_name").notNullable();
            table.string("address").notNullable();
            table.string("tin_no").notNullable();
            table.timestamps(true, true);
          })

          .createTable("purchase_request", (table) => {
            table.increments("uuid").primary();
            table.date("date").notNullable();
            table.string("company_name").notNullable();
            table.string("address").notNullable();
            table.string("attention").notNullable();
            table.string("description").notNullable();
            table.integer("quantity").notNullable();
            table.string("unit").notNullable();
            table.double("unit_cost").notNullable();
            table.double("amount").notNullable();
            table.string("remarks").notNullable();
            table.timestamps(true, true);
            table
              .integer("item_code")
              .unsigned()
              .notNullable()
              .references("uuid") // Change this to "uuid" to match the primary key of "users" table
              .inTable("purchase_items")
              .onDelete("CASCADE");
            table
              .foreign("description")
              .references("description")
              .inTable("purchase_items");

            table.index("item_code");
            table.index("description");
          })

          .createTable("canvass", (table) => {
            table.increments("uuid").primary();
            table.date("date").notNullable();
            table.string("company_name").notNullable();
            table.string("address").notNullable();
            table.string("tel_no").notNullable();
            table.string("tin_no").notNullable();
            table.string("description").notNullable();
            table.integer("quantity").notNullable();
            table.string("unit").notNullable();
            table.double("unit_price").notNullable();
            table.double("total_amount").notNullable();
            table.string("canvasser").notNullable();
            table.timestamps(true, true);
            table
              .integer("item_code")
              .unsigned()
              .notNullable()
              .references("uuid") // Change this to "uuid" to match the primary key of "users" table
              .inTable("purchase_items")
              .onDelete("CASCADE");
            table
              .foreign("description")
              .references("description")
              .inTable("purchase_items");
            table
              .string("quoted_by_rep")
              .notNullable()
              .references("username")
              .inTable("users")
              .onDelete("RESTRICT");

            table.index("description");
          })

          .createTable("purchase_order", (table) => {
            table.increments("uuid").primary();
            table.date("date").notNullable();
            table.date("due_date").notNullable();
            table.integer("purchase_order_no").notNullable();
            table.string("company_name_supplier").notNullable();
            table.string("address").notNullable();
            table.string("terms_of_agreement").notNullable();
            table.string("item_code").notNullable();
            table.string("description").notNullable();
            table.integer("quantity").notNullable();
            table.string("unit").notNullable();
            table.double("unit_price").notNullable();
            table.double("amount").notNullable();
            table.string("remarks").notNullable();
            table.timestamps(true, true);
            table
              .foreign("item_code")
              .references("item_code")
              .inTable("purchase_items");

            table.index("item_code");
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
                "Projects",
                "Purchase Items",
                "Purchase Request",
                "Canvass",
                "Purchase Order",
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
            username: "eg",
            password:
              "$2b$10$6Hq/7njiVUixrRytZmj.XuPsGqxvet.dAVhdYyIQsLINk/GuZBgee",
            firstname: "Mark",
            lastname: "Salem",
            // region: "all",
            role: "superadmin",
          },
          {
            username: "tejey",
            password: "$2a$12$kIpzC4.O.tvwMQ0q7HaH7.v7usQ/jrl2SKq8CZ1MTpAGa72d1rv/2",
            firstname: "Tejey",
            lastname: "Casucog",
            // region: "all",
            role: "canvasser",
          },
          {
            username: "mark",
            password: "$2a$12$SyV2IQFzjS5hy/ubz2K64ePju1I.r8/wcdT/VF1ZL3RvCn/ujHWTK",
            firstname: "Mark",
            lastname: "Salem",
            // region: "all",
            role: "pr",
          },
          {
            username: "bontrade",
            password:
              "$2b$10$zSsWH9rWGCTVsoA4hN4Gy.Rdn24uoqdYE2r1xFI3bm6m8xWBcdhz.",
            firstname: "PhilFIDA",
            lastname: "PhilFIDA",
            // region: "all",
            role: "bontrade",
          },
          {
            username: "ugtrade",
            password:
              "$2b$10$9IxuG4.xcu5mLUDryGLn9.vPRJs9HS.gbVEDf2yxrhGWTb0twajHK",
            firstname: "PhilFIDA",
            lastname: "PhilFIDA",
            // region: "all",
            role: "ugtrade",
          },
          {
            username: "erotas",
            password:
              "$2b$10$pTm5849Ep/tN1/ZGngiTbeu160uXoqbccV2zRW1zsxxlzEaYvXz3a",
            firstname: "PhilFIDA",
            lastname: "PhilFIDA",
            // region: "all",
            role: "erotas",
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

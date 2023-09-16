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

          .createTable("brand", (table) => {
            table.increments("uuid").primary();
            table.string("name").notNullable();
            table.timestamps(true, true);
            table.integer("status").defaultTo(1).notNullable();

            table.index("name");
          })

          .createTable("category", (table) => {
            table.increments("uuid").primary();
            table.string("name").notNullable();
            table.timestamps(true, true);
            table.integer("status").defaultTo(1).notNullable();

            table.index("name");
          })

          .createTable("supplier", (table) => {
            table.increments("uuid").primary();
            table.string("name").notNullable();
            table.string("address").notNullable();
            table.string("phone_no").notNullable();
            table.string("mobile_no").notNullable();
            table.string("tin_no").notNullable();
            table.timestamps(true, true);
            table.integer("status").defaultTo(1).notNullable();

            table.index("name");
          })

          .createTable("product", (table) => {
            table.increments("uuid").primary();
            table.string("name").notNullable();
            table.string("item_code").notNullable();
            table.double("price").notNullable();
            table
              .integer("brand_id")
              .unsigned()
              .notNullable()
              .references("uuid") // Change this to "uuid" to match the primary key of "users" table
              .inTable("brand")
              .onDelete("CASCADE");
            table
              .integer("category_id")
              .unsigned()
              .notNullable()
              .references("uuid") // Change this to "uuid" to match the primary key of "users" table
              .inTable("category")
              .onDelete("CASCADE");
            table
              .integer("supplier_id")
              .unsigned()
              .notNullable()
              .references("uuid") // Change this to "uuid" to match the primary key of "users" table
              .inTable("supplier")
              .onDelete("CASCADE");

            table.string("description").nullable();
            table.integer("status").defaultTo(1).notNullable();
            table.timestamps(true, true);
            table
              .integer("added_by")
              .unsigned()
              .notNullable()
              .references("uuid") // Change this to "uuid" to match the primary key of "users" table
              .inTable("users")
              .onDelete("CASCADE");
            
            table.index("item_code");
            table.index("price");
            table.index("name");
            table.index("description");
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

          .createTable("canvass", (table) => {
            table.increments("uuid").primary();
            table.string("name").notNullable();
            table.string("item_code").notNullable();
            table.integer("quantity").defaultTo(1).notNullable();
            table.double("price").notNullable();
            table.string("description").nullable();
            table.integer("status").defaultTo(1).notNullable();
            table.timestamps(true, true);
            table
              .foreign("item_code")
              .references("item_code")
              .inTable("product");
            table.index("item_code");
          })

          .createTable("purchase_item", (table) => {
            table.increments("uuid").primary();
            table.string("item_code").notNullable();
            table.string("ref_code").notNullable();
            table.double("price").notNullable();
            table.integer("quantity").notNullable();
            table
              .integer("product_id")
              .unsigned()
              .notNullable()
              .references("uuid")
              .inTable("product")
              .onDelete("RESTRICT");
            table
              .integer("brand_id")
              .unsigned()
              .notNullable()
              .references("uuid")
              .inTable("brand")
              .onDelete("RESTRICT");
            table
              .integer("supplier_id")
              .unsigned()
              .notNullable()
              .references("uuid")
              .inTable("supplier")
              .onDelete("RESTRICT");
            table
              .integer("category_id")
              .unsigned()
              .notNullable()
              .references("uuid")
              .inTable("category")
              .onDelete("RESTRICT");
            table.string("description").nullable();
            table.timestamps(true, true);

            table.foreign("price").references("price").inTable("product");
            table
              .foreign("item_code")
              .references("item_code")
              .inTable("product");
            table.index("price");
            table.index("item_code");
          })

          .createTable("purchase", (table) => {
            table.increments("uuid").primary();
            table.string("ref_code").notNullable();
            table.string("pr_code").nullable();
            table.string("po_code").nullable();
            table.string("tf_code").nullable();
            table.string("or_code").nullable();
            table.string("process_type").nullable().defaultTo("request");
            table.string("pr_status").notNullable().defaultTo(1);
            table.string("po_status").notNullable().defaultTo(1);
            table.string("tf_status").notNullable().defaultTo(1);
            table.string("company_name").notNullable().defaultTo("Earth");
            table
              .string("address")
              .notNullable()
              .defaultTo("3rd planet, Solar System, Milky Way Galaxy");
            table.integer("item_count").notNullable();
            table.double("total_amount");
            table.string("terms_of_agreement").nullable(); //manual
            table.string("purpose").nullable(); //maunal
            table.string("unit").nullable(); //manual
            table.string("attention").nullable(); //manual
            table.string("remarks").nullable(); //manual
            table.date("request_date").nullable();
            table.date("order_date").nullable();
            table.date("order_due_date").nullable();
            table.date("transmit_date").nullable();
            table.date("billing_date").nullable();
            table.date("received_date").nullable();
            table.date("prepared_date").nullable();
            table.string("prepared_by").nullable(); //manual
            table.string("noted_by").nullable(); //manual
            table.string("received_by").nullable(); //manual
            table.timestamps(true, true);
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
                "Products",
                "Purchase Request",
                "Canvass",
                "Cart",
                "Purchase Order",
                "Categories",
                "Suppliers",
                "Brands",
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

        // .createTable("nursery", (table) => {
        //   table.increments("uuid").primary();
        //   table.date("report_date").notNullable();
        //   table.string("nurseries").notNullable();
        //   table.string("funded_by").notNullable();
        //   table.string("region").notNullable();
        //   table.string("province").notNullable();
        //   table.string("district").nullable();
        //   table.string("municipality").notNullable();
        //   table.string("barangay").notNullable();
        //   table.date("birthdate").notNullable();
        //   table.integer("age").notNullable();
        //   table.string("name_of_cooperative_individual").notNullable();
        //   table.string("gender").notNullable();
        //   table.date("date_established").notNullable();
        //   table.double("area_in_hectares_ha").notNullable();
        //   table.string("variety_used").notNullable();
        //   table.integer("period_of_moa").notNullable();
        //   table.string("remarks").nullable();
        //   table.timestamps(true, true);
        //   table
        //     .integer("added_by")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid")
        //     .inTable("users")
        //     .onDelete("RESTRICT");
        // })

        await req.db("users").insert([
          {
            username: "eg",
            password:
              "$2b$10$6Hq/7njiVUixrRytZmj.XuPsGqxvet.dAVhdYyIQsLINk/GuZBgee",
            firstname: "Matthew",
            lastname: "Romero",
            // region: "all",
            role: "superadmin",
          },
          {
            username: "tejey",
            password:
              "$2a$12$kIpzC4.O.tvwMQ0q7HaH7.v7usQ/jrl2SKq8CZ1MTpAGa72d1rv/2",
            firstname: "Tejey",
            lastname: "Casucog",
            // region: "all",
            role: "canvasser",
          },
          {
            username: "Rayder",
            password:
              "$2b$10$qSTG1Qk0/XD5HS0vTz.E.eIWQCAJPQSrEbq8Zc.rmtUm6.8NVT2m6",
            firstname: "Ray",
            lastname: "Hernandez",
            // region: "all",
            role: "superadmin",
          },
          {
            username: "mark",
            password:
              "$2a$12$SyV2IQFzjS5hy/ubz2K64ePju1I.r8/wcdT/VF1ZL3RvCn/ujHWTK",
            firstname: "Mark",
            lastname: "Salem",
            // region: "all",
            role: "superadmin",
          },
          {
            username: "bontrade",
            password:
              "$2b$10$zSsWH9rWGCTVsoA4hN4Gy.Rdn24uoqdYE2r1xFI3bm6m8xWBcdhz.",
            firstname: "PhilFIDA",
            lastname: "PhilFIDA",
            // region: "all",
            role: "user",
          },
          {
            username: "ugtrade",
            password:
              "$2b$10$9IxuG4.xcu5mLUDryGLn9.vPRJs9HS.gbVEDf2yxrhGWTb0twajHK",
            firstname: "PhilFIDA",
            lastname: "PhilFIDA",
            // region: "all",
            role: "user",
            status: 0,
          },
          {
            username: "erotas",
            password:
              "$2b$10$pTm5849Ep/tN1/ZGngiTbeu160uXoqbccV2zRW1zsxxlzEaYvXz3a",
            firstname: "PhilFIDA",
            lastname: "PhilFIDA",
            // region: "all",
            role: "user",
            status: 0,
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

const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const asyncHandler = require("express-async-handler");
const Service = require("./cart-service");

const service = new Service();
const router = express.Router();

//Add
router.post("/cart", db, asyncHandler(service.add));

//Get
router.get("/cart/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/cart/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/cart/delete/:uuid", db, asyncHandler(service.delete));

//Export
// router.get("/project/export", db, asyncHandler(service.exportDataToExcel));

module.exports = router;

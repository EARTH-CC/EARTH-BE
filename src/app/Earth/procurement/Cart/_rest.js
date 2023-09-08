const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const asyncHandler = require("express-async-handler");
const Service = require("./cart-service");

const service = new Service();
const router = express.Router();

//Add
router.post("/cart", db, asyncHandler(service.add));

//Get All
router.get("/cart/get", db, asyncHandler(service.getAllCart));

//Get Cart Price
router.get("/cart/price", db, asyncHandler(service.getCartPrice));

//Get
router.get("/cart/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/cart/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/cart/delete/:uuid", db, asyncHandler(service.delete));



module.exports = router;

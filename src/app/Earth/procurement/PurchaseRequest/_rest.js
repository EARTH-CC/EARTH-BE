const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const schema = require("../../../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./purchaseRequest-service");
const uploadFile = require("../../../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

//Add
router.post("/purchaseRequest", db, asyncHandler(service.Add));

//Get
router.get("/purchaseRequest/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/purchaseRequest/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/purchaseRequest/delete/:uuid", db, asyncHandler(service.delete));

//Get All
router.get("/purchaseRequest/get", db, asyncHandler(service.getAllData));

//Export
// router.get("/project/export", db, asyncHandler(service.exportDataToExcel));

module.exports = router;

const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const schema = require("../../../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./purchase-service");
const uploadFile = require("../../../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

//Add
router.post("/purchaseItems", db, asyncHandler(service.add));

//Get
router.get("/purchaseItems/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/purchaseItems/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/purchaseItems/delete/:uuid", db, asyncHandler(service.delete));

//getAllData
// router.get("/purchaseItems/get", db, asyncHandler(service.getAllData));

//Export
// router.get("/project/export", db, asyncHandler(service.exportDataToExcel));

module.exports = router;

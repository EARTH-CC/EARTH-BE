const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const schema = require("../../../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./purchaseOrder-service");
const uploadFile = require("../../../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

//Add
router.post("/purchaseOrder", db, asyncHandler(service.add));

//Get
router.get("/purchaseOrder/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/purchaseOrder/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/purchaseOrder/delete/:uuid", db, asyncHandler(service.delete));

//Export
// router.get("/project/export", db, asyncHandler(service.exportDataToExcel));

module.exports = router;

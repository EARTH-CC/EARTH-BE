const express = require("express");
const router = express.Router();
const { errorHandler } = require("../middlewares/errors");

router.use(errorHandler);
router.use(require("./users/_rest"));
router.use(require("./download/_rest"));
router.use(require("./logs/_rest"));
// TAD REPORTS
router.use(require("./tad/abacaDiseaseManagement/_rest"));
router.use(require("./tad/cocoon/_rest"));
router.use(require("./tad/cotton/_rest"));
router.use(require("./tad/distribution/_rest"));
router.use(require("./tad/expansionAndRehabilitation/_rest"));
router.use(require("./tad/expansionUnderCoconut/_rest"));
router.use(require("./tad/iecMaterials/_rest"));
router.use(require("./tad/nursery/_rest"));
router.use(require("./tad/pmSurvived/_rest"));
router.use(require("./tad/training/_rest"));
router.use(require("./tad/ndrrm/_rest"));

// EARTH
router.use(require("./Earth/Projects/_rest"));
router.use(require("./Earth/procurement/Supplier/_rest"));
router.use(require("./Earth/procurement/Category/_rest"));
router.use(require("./Earth/procurement/Brand/_rest"));
router.use(require("./Earth/procurement/Product/_rest"));
router.use(require("./Earth/procurement/Canvass/_rest"));
router.use(require("./Earth/procurement/Cart/_rest"));
router.use(require("./Earth/procurement/PurchaseRequest/_rest"));

router.use(require(".//Earth/procurement/purchaseOrder/_rest"));

module.exports = router;

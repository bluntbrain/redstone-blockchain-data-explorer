const express = require("express");
const tablesController = require("../controllers/tablesController");
const router = express.Router();

router.get("/tables", tablesController.getTables);
router.get("/table/:tableName", tablesController.getTableByName);

module.exports = router;

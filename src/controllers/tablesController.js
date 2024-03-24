const { getTablesList, getTableDataByName } = require("../helpers/database");
const { bufferToReadable } = require("../helpers/utility");

exports.getTables = async (req, res) => {
  try {
    const tables = await getTablesList();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTableByName = async (req, res) => {
  const { tableName } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const search = req.query.search || "";

  try {
    const { rows, totalRows } = await getTableDataByName(
      tableName,
      page,
      pageSize,
      search
    );
    const totalPages = Math.ceil(totalRows / pageSize);
    const readableRows = rows.map(bufferToReadable);

    res.json({
      rows: readableRows,
      page,
      totalPages,
      totalRows,
    });
  } catch (err) {
    console.error(`Error on /table/${tableName} route`, err);
    if (err.message === "Invalid table name") {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

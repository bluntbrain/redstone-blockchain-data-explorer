const { Pool } = require("pg");

const pool = new Pool({
  user: "root",
  host: "localhost",
  database: "postgres",
  password: "",
  port: 5432,
});

const getTablesList = async () => {
  try {
    const queryText =
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';";
    const { rows } = await pool.query(queryText);
    return rows.map((row) => row.tablename);
  } catch (err) {
    console.error("Error fetching tables", err);
    throw err;
  }
};
const getTableDataByName = async (
  tableName,
  page = 1,
  pageSize = 10,
  search = ""
) => {
  try {
    const validTables = await getValidTables();
    const validTableEntry = validTables.find(
      (entry) => entry.table.toLowerCase() === tableName.toLowerCase()
    );
    if (!validTableEntry) {
      throw new Error("Invalid table name");
    }

    const offset = (page - 1) * pageSize;
    let queryParams = [];
    let whereClause = "";
    console.log("search.trim()", search.trim());
    if (search.trim() !== "") {
      whereClause = `WHERE player_address = decode($1, 'hex')`;
      queryParams.push(search);
    }

    const baseQuery = `FROM "${validTableEntry.schema}"."${validTableEntry.table}" ${whereClause}`;
    const queryText = `SELECT * ${baseQuery} LIMIT $${
      queryParams.length + 1
    } OFFSET $${queryParams.length + 2};`;

    console.log("queryText", queryText, queryParams);
    queryParams.push(pageSize, offset);

    const countQueryText = `SELECT COUNT(*) ${baseQuery};`;

    const rowsResult = await pool.query(queryText, queryParams);
    const countResult = await pool.query(
      countQueryText,
      queryParams.slice(0, queryParams.length - 2)
    );

    return {
      rows: rowsResult.rows,
      totalRows: parseInt(countResult.rows[0].count, 10),
    };
  } catch (err) {
    console.error(`Error fetching data for table ${tableName}`, err);
    throw err;
  }
};

const getValidTables = async () => {
  const queryText = `
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog');
  `;
  const result = await pool.query(queryText);
  return result.rows.map((row) => ({
    schema: row.table_schema,
    table: row.table_name,
  }));
};

const getTableColumns = async (schema, tableName) => {
  const queryText = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2;
    `;
  const { rows } = await pool.query(queryText, [schema, tableName]);
  return rows.map((row) => row.column_name);
};

module.exports = {
  getTablesList,
  getTableDataByName,
};

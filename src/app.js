const express = require("express");
const tableRoutes = require("./routes/tablesRoutes");
const app = express();
const port = 3003;

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));

app.use("/api", tableRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

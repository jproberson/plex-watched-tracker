const express = require("express");
const path = require("path");

const { port, configDir } = require("./server-config");

const routes = require("./routes");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use("/thumbnails", express.static(path.join(configDir, "thumbnails")));
app.use(routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
// console.log(Object.keys(process.env));

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

console.log("Connecting to database...");
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    //console.log(connection.connection);
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.log(err);
    console.log("Error connecting to database!");
  });

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || "localhost";

app.listen(port, hostname, () => {
  console.log(
    `Server running on http://${process.env.HOSTNAME}:${process.env.PORT}`
  );
});

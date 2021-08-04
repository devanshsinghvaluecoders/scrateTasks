var express = require("express");

var dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
var app = express();
require("./database/conn");

app.get("/", (req, res) => {
  res.send("hello to devansah");
});

//login api

app.listen(process.env.PORT || 3090, () => {
  console.log(`connection succesfull  ${process.env.PORT}`);
});

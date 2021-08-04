var mongoose = require("mongoose");

var db = process.env.DATA;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connection to database sucessfull");
  })
  .catch(() => console.log("failed"));

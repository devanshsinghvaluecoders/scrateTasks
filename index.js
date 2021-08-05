var express = require("express");
var cookieParser = require("cookie-parser");
const cors = require("cors");

var dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
var app = express();
var PropertySchema = require("./middleware/SitesSchema");

require("./database/conn");
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("hello to devansah");
});

app.post("/GetProperty", async (req, res) => {
  const { searching, limit } = req.body;

  try {
    if (searching.length > 0) {
      const regex = new RegExp(searching);
      console.log(searching);
      console.log(regex);

      const rootUser = await PropertySchema.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: regex, $options: "si" } },
              { address: { $regex: regex, $options: "si" } },
              { sqft: { $regex: regex, $options: "si" } },
              { Beds: { $regex: regex, $options: "si" } },
              { Baths: { $regex: regex, $options: "si" } },
              { tags: { $regex: regex, $options: "si" } },
            ],
          },
        },
        { $sort: { created_at: -1 } },
        { $limit: limit },
      ]);
      res.status(200).json({ rootUser });
    } else {
      const rootUser = await PropertySchema.aggregate([
        { $sort: { created_at: -1 } },
        { $limit: limit },
      ]);
      res.status(200).json({ rootUser });
    }
  } catch (err) {
    res.json(err);
  }
});
//post property to the site
app.post("/postProperty", async (req, res) => {
  const {
    name,
    price,
    images,
    address,
    Beds,
    Baths,
    unit,
    sqft,
    onWards,
    tags,
    pdfs,
  } = req.body;
  console.log(tags);
  try {
    if (!name || !price || !images || !address || !unit) {
      res.json({ error: "please fill all" });
    } else {
      const data = new PropertySchema({
        name,
        price,
        unit,
        images,
        address,
        Beds,
        Baths,
        sqft,
        onWards,
        tags,
        pdfs,
      });
      data
        .save()
        .then(() => res.json({ message: "data saved sucessfully" }))
        .catch((err) => res.json({ error: "no save" }));
    }
  } catch (err) {
    res.json(err);
  }
});

app.listen(process.env.PORT || 3080, () => {
  console.log(`connection succesfull  ${process.env.PORT}`);
});

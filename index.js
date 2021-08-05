var express = require("express");
var cookieParser = require("cookie-parser");
const cors = require("cors");

var dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
var app = express();
var authenticate = require("./middleware/authenticate");

var ContactSchema = require("./middleware/ContactSchema");
var BlogsSchema = require("./middleware/Blogs");
var PropertySchema = require("./middleware/SitesSchema");
var EnquirySchema = require("./middleware/EnquirySchema");
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
// Admin panel blogs
// get request blogs
app.get("/Blogspage", async (req, res) => {
  try {
    const rootUser = await BlogsSchema.aggregate([
      { $sort: { created_at: -1 } },
      { $limit: 4 },
    ]);
    // .find().sort({ created_at: -1 });
    res.status(200).json({ rootUser });
  } catch (err) {
    res.status(401).send("unautherised");
    console.log(err);
  }
});
app.get("/AdminBlogs", authenticate, async (req, res) => {
  try {
    const rootUser = await BlogsSchema.aggregate([
      { $sort: { created_at: -1 } },
    ]);
    // .find().sort({ created_at: -1 });
    res.status(200).json({ rootUser });
  } catch (err) {
    res.status(401).send("unautherised");
    console.log(err);
  }
});
//Admin panel blogs
// post request blogs
app.post("/adminBlogs", async (req, res) => {
  const { name, images, description } = req.body;

  try {
    if (!name || !images || !description) {
      res.json({ error: "please fill all" });
    } else {
      const data = new BlogsSchema({
        name,

        images,
        description,
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
//main blog api
app.post("/allblogs", async (req, res) => {
  const { searching, limit } = req.body;

  try {
    if (searching.length > 0) {
      const regex = new RegExp(searching);
      console.log(searching);
      console.log(regex);

      const rootUser = await BlogsSchema.aggregate([
        {
          $match: {
            name: { $regex: regex, $options: "si" },
          },
        },
        { $sort: { created_at: -1 } },
        { $limit: limit },
      ]);
      res.status(200).json({ rootUser });
    } else {
      const rootUser = await BlogsSchema.aggregate([
        { $sort: { created_at: -1 } },
        { $limit: limit },
      ]);
      res.status(200).json({ rootUser });
    }
  } catch (err) {
    res.json(err);
  }
});
//delete blog api
app.post("/DeleteBlog", authenticate, async (req, res) => {
  try {
    const data = await BlogsSchema.findByIdAndDelete(req.body.id);
    res.status(200).json(data);
  } catch (err) {
    res.json(err);
  }
});

//delete property
app.post("/DeleteProperty", authenticate, async (req, res) => {
  try {
    const data = await PropertySchema.findByIdAndDelete(req.body.id);
    res.status(200).json(data);
  } catch (err) {
    res.json(err);
  }
});
app.get("/GetEnquiry", async (req, res) => {
  try {
    const rootUser = await EnquirySchema.find().sort({ created_at: -1 });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
//post enquiry
app.post("/PostEnquiry", async (req, res) => {
  try {
    const { name, email, number } = req.body;
    console.log(req.body);
    if (!name || !email || !number) {
      console.log("error from contact");
      res.json({ error: "plz fill all" });
    } else {
      const data = new EnquirySchema({
        name,
        email,
        number,
      });
      console.log(data);
      data
        .save()
        .then(() => res.json({ message: "data saved sucessfully" }))
        .catch((err) => res.json({ error: "no save" }));
    }
  } catch (err) {
    res.json(err);
  }
});
app.get("/GetPropertyAdmin", authenticate, async (req, res) => {
  try {
    const rootUser = await PropertySchema.find().sort({ created_at: -1 });

    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    console.log(req.body);
    if (!name || !email || !phone || !message) {
      res.json({ error: "plz fill all" });
    } else {
      const data = new ContactSchema({
        name,
        email,
        phone,
        message,
      });
      data
        .save()
        .then(() => res.json({ message: "data saved sucessfully" }))
        .catch((err) => res.json({ error: "no save" }));
    }
  } catch (err) {
    res.json({ error: "no save" });
  }
});
app.post("/adminMessageSingle", authenticate, async (req, res) => {
  const _id = req.body.id;
  try {
    const rootUser = await ContactSchema.find({ _id });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.post("/adminPropertiesSingle", authenticate, async (req, res) => {
  const _id = req.body.id;
  try {
    const rootUser = await PropertySchema.find({ _id });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.post("/adminBlogsingle", authenticate, async (req, res) => {
  const _id = req.body.id;
  try {
    const rootUser = await BlogsSchema.find({ _id });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});

app.listen(process.env.PORT || 3080, () => {
  console.log(`connection succesfull  ${process.env.PORT}`);
});

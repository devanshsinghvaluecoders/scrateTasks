var express = require("express");
var cookieParser = require("cookie-parser");
const cors = require("cors");

var dotenv = require("dotenv");
var jwtoken = require("jsonwebtoken");

dotenv.config({ path: "./.env" });
var app = express();
var bcrypt = require("bcryptjs");
var authenticate = require("./middleware/authenticate");
var ContactSchema = require("./middleware/ContactSchema");
var BlogsSchema = require("./middleware/Blogs");
var PropertySchema = require("./middleware/SitesSchema");
var EnquirySchema = require("./middleware/EnquirySchema");
var LoginSchema = require("./middleware/UserSchema");
var path = require('path')

require("./database/conn");
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname + '/build')))

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, '/build', '/index.html'))
  // res.send("sad")
  // res.sendFile(path.join(__dirname + "/Car" + '/index.html'));
});
app.get("/api", (req, res) => {
  res.send("hello to devansah");
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ error: "fill all" });
    }
    const UserLogin = await LoginSchema.findOne({ email });
    if (UserLogin) {
      const isMatch = await bcrypt.compare(password, UserLogin.password);
      const token = await UserLogin.generateToken();
      // res.cookie("jwtverify", token, {
      //   expires: new Date(Date.now() + 25892000),
      //   httpOnly: true,
      // });

      if (!isMatch) {
        res.status(400).json({ error: "invalid credential" });
      } else {
        res.status(200).json({ message: "login succesfull", token });
      }
    } else {
      res.status(400).json({ message: "user Dont exist" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
});
app.post("/api/register", (req, res) => {
  const { name, email, security, password, Cpassword } = req.body;
  console.log(security);
  if (!name || !email || !security || !password || !Cpassword) {
    res.json({ error: "please fill all values" });
  } else if (password !== Cpassword) {
    res.json({ error: "pasword donot match" });
  } else if (security != 5854) {
    res.json({ error: "security donot match" });
  } else {
    LoginSchema.findOne({ email }).then((userExist) => {
      if (userExist) {
        res.json({ error: "user already exist" });
      } else {
        const data = new LoginSchema({
          name,
          email,

          password,
          Cpassword,
        });
        data
          .save()
          .then(() => {
            res.json({ message: "success" });
          })
          .catch(() => {
            console.log("no data saved");
            res.json({ error: "success" });
          });
      }
    });
  }
});
app.get("/api/adminMessage", async (req, res) => {
  try {
    const rootUser = await ContactSchema.find().sort({ created_at: -1 });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.get("/api/GetPropertyAdmin", async (req, res) => {
  try {
    const rootUser = await PropertySchema.find().sort({ created_at: -1 });

    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.get("/api/GetEnquiry", async (req, res) => {
  try {
    const rootUser = await EnquirySchema.find().sort({ created_at: -1 });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.get("/api/AdminBlogs", async (req, res) => {
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
app.post("/api/adminMessageSingle", async (req, res) => {
  const _id = req.body.id;
  try {
    const rootUser = await ContactSchema.find({ _id });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.post("/api/AdminCheck", async (req, res) => {
  try {
    const token = req.body.Token;
    console.log(token);

    const verifyToken = jwtoken.verify(token, process.env.SECRET);
    const rootUser = await LoginSchema.findOne({
      _id: verifyToken._id,
    });
    console.log(rootUser);

    if (rootUser) {
      res.json({ message: "yes" });
    } else {
      res.status(401).json({ error: "unautherised" });
    }
  } catch (err) {
    res.status(401).json({ error: "unautherised" });
  }
});
//delete blog api
app.post("/api/DeleteBlog", async (req, res) => {
  try {
    const data = await BlogsSchema.findByIdAndDelete(req.body.id);
    res.status(200).json(data);
  } catch (err) {
    res.json(err);
  }
});

//delete property
app.post("/api/DeleteProperty", async (req, res) => {
  try {
    const data = await PropertySchema.findByIdAndDelete(req.body.id);
    res.status(200).json(data);
  } catch (err) {
    res.json(err);
  }
});

app.post("/api/adminPropertiesSingle", async (req, res) => {
  const _id = req.body.id;
  try {
    const rootUser = await PropertySchema.find({ _id });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.post("/api/adminBlogsingle", async (req, res) => {
  const _id = req.body.id;
  try {
    const rootUser = await BlogsSchema.find({ _id });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
//logout api
app.get("/api/logout", authenticate, (req, res) => {
  // console.log(req.cookies.jwtverify);
  res.clearCookie("jwtverify", { path: "/api/" });
  res.status(200).send("userlogout");
});
app.post("/api/GetProperty", async (req, res) => {
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
app.post("/api/advGetProperty", async (req, res) => {
  const { advsearching, searchsqft, searchlocation, limit } = req.body;
  try {
    if (
      advsearching.length > 0 &&
      searchsqft.length === 0 &&
      searchlocation.length === 0
    ) {
      const regex = new RegExp(advsearching);
      console.log("advsearching", advsearching);

      const rootUser = await PropertySchema.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: regex, $options: "si" } },
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
    } else if (
      advsearching.length === 0 &&
      searchsqft.length > 0 &&
      searchlocation.length === 0
    ) {
      const regex = new RegExp(parseInt(searchsqft));
      const sqft1 = parseInt(searchsqft);

      console.log("searchsqft", regex);

      const rootUser = await PropertySchema.aggregate([
        {
          $match: {
            $or: [{ sqft: sqft1 }],
          },
        },
        { $sort: { created_at: -1 } },
        { $limit: limit },
      ]);
      res.status(200).json({ rootUser });
    } else if (
      advsearching.length === 0 &&
      searchsqft.length === 0 &&
      searchlocation.length > 0
    ) {
      const regex = new RegExp(searchlocation);
      console.log("searchlocation", searchlocation);

      const rootUser = await PropertySchema.aggregate([
        {
          $match: {
            $or: [{ address: { $regex: regex, $options: "si" } }],
          },
        },
        { $sort: { created_at: -1 } },
        { $limit: limit },
      ]);
      res.status(200).json({ rootUser });
    } else if (
      advsearching.length > 0 &&
      searchsqft.length > 0 &&
      searchlocation.length === 0
    ) {
      const regex = new RegExp(advsearching);
      const regex2 = new RegExp(searchsqft);
      const sqft1 = parseInt(searchsqft);

      console.log("advsearching", advsearching);
      console.log("searchsqft", searchsqft);

      const rootUser = await PropertySchema.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: regex, $options: "si" } },
              { sqft: sqft1 },
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
    } else if (
      advsearching.length === 0 &&
      searchsqft.length > 0 &&
      searchlocation.length > 0
    ) {
      const regex = new RegExp(searchsqft);
      const sqft1 = parseInt(searchsqft);

      const regex2 = new RegExp(searchlocation);

      console.log("searchsqft", searchsqft);
      console.log("searchlocation", searchlocation);

      const rootUser = await PropertySchema.aggregate([
        {
          $match: {
            $and: [
              { address: { $regex: regex2, $options: "si" } },
              { sqft: sqft1 },
            ],
          },
        },
        { $sort: { created_at: -1 } },
        { $limit: limit },
      ]);
      res.status(200).json({ rootUser });
    } else if (
      advsearching.length > 0 &&
      searchsqft.length === 0 &&
      searchlocation.length > 0
    ) {
      const regex = new RegExp(advsearching);
      console.log("advsearching", advsearching);
      const regex2 = new RegExp(searchlocation);
      console.log("searchlocation", searchlocation);

      const rootUser = await PropertySchema.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: regex, $options: "si" } },
              { address: { $regex: regex2, $options: "si" } },
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
    } else if (
      advsearching.length > 0 &&
      searchsqft.length > 0 &&
      searchlocation.length > 0
    ) {
      const regex = new RegExp(advsearching);
      const regex2 = new RegExp(searchsqft);
      const sqft1 = parseInt(searchsqft);

      const regex3 = new RegExp(searchlocation);

      console.log("advsearching", advsearching);
      console.log("searchsqft", searchsqft);
      console.log("searchlocation", searchlocation);

      const rootUser = await PropertySchema.aggregate([
        {
          $match: {
            $and: [
              { address: { $regex: regex3, $options: "si" } },
              { sqft: sqft1 },
            ],
            $or: [
              { name: { $regex: regex, $options: "si" } },
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
app.post("/api/postProperty", async (req, res) => {
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
app.get("/api/Blogspage", async (req, res) => {
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
app.post("/api/PropertiesSingle", async (req, res) => {
  const _id = req.body.id;
  try {
    const rootUser = await PropertySchema.find({ _id });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
//Admin panel blogs
// post request blogs
app.post("/api/adminBlogs", async (req, res) => {
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
app.post("/api/allblogs", async (req, res) => {
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

app.get("/api/GetEnquiry", async (req, res) => {
  try {
    const rootUser = await EnquirySchema.find().sort({ created_at: -1 });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
//post enquiry
app.post("/api/PostEnquiry", async (req, res) => {
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

app.post("/api/contact", async (req, res) => {
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

app.listen(process.env.PORT || 3080, () => {
  console.log(`connection succesfull  ${process.env.PORT}`);
});

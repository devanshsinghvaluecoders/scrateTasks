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
require("./database/conn");
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("hello to devansah");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ error: "fill all" });
    }
    const UserLogin = await LoginSchema.findOne({ email });
    if (UserLogin) {
      const isMatch = await bcrypt.compare(password, UserLogin.password);
      const token = await UserLogin.generateToken();
      res.cookie("jwtverify", token, {
        expires: new Date(Date.now() + 25892000),
        httpOnly: false,
      });
      // res.cookie("name", "geeksforgeeks");

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
app.post("/register", (req, res) => {
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
app.get("/adminMessage", async (req, res) => {
  try {
    const val = sessionStorage.getItem("Token");
    console.log(val);

    const rootUser = await ContactSchema.find().sort({ created_at: -1 });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.get("/GetPropertyAdmin", async (req, res) => {
  try {
    const rootUser = await PropertySchema.find().sort({ created_at: -1 });

    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
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
app.get("/AdminBlogs", async (req, res) => {
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
app.post("/adminMessageSingle", async (req, res) => {
  const _id = req.body.id;
  try {
    const rootUser = await ContactSchema.find({ _id });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.post("/AdminCheck", async (req, res) => {
  try {
    const token = req.body.Token;
    const verifyToken = jwtoken.verify(token, process.env.SECRET);
    const rootUser = await LoginSchema.findOne({
      _id: verifyToken._id,
    });

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
app.post("/DeleteBlog", async (req, res) => {
  try {
    const data = await BlogsSchema.findByIdAndDelete(req.body.id);
    res.status(200).json(data);
  } catch (err) {
    res.json(err);
  }
});

//delete property
app.post("/DeleteProperty", async (req, res) => {
  try {
    const data = await PropertySchema.findByIdAndDelete(req.body.id);
    res.status(200).json(data);
  } catch (err) {
    res.json(err);
  }
});

app.post("/adminPropertiesSingle", async (req, res) => {
  const _id = req.body.id;
  try {
    const rootUser = await PropertySchema.find({ _id });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
app.post("/adminBlogsingle", async (req, res) => {
  const _id = req.body.id;
  try {
    const rootUser = await BlogsSchema.find({ _id });
    res.status(200).json({ rootUser });
  } catch (err) {
    console.log(err);
  }
});
//logout api
app.get("/logout", authenticate, (req, res) => {
  // console.log(req.cookies.jwtverify);
  res.clearCookie("jwtverify", { path: "/" });
  res.status(200).send("userlogout");
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
app.post("/PropertiesSingle", async (req, res) => {
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

app.listen(process.env.PORT || 3080, () => {
  console.log(`connection succesfull  ${process.env.PORT}`);
});

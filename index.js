var express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
var dotenv = require("dotenv");

dotenv.config({ path: "./.env" });
var app = express();

var LoginSchema = require("./middleware/UserSchema");
var MeetingSchema = require("./middleware/MeetingSchema");

require("./database/conn");
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello to devansah");
});
app.post("/users/new", (req, res) => {
  const { userName } = req.body;
  LoginSchema.findOne({ userName }).then((userExist) => {
    if (userExist) {
      res.json({ error: "user already exist" });
    } else {
      const data = new LoginSchema({
        userName,
      });
      data
        .save()
        .then(() => {
          res.json({ message: "success", uid: ObjectId(data._id) });
        })
        .catch(() => {
          console.log("no data saved");
          res.json({ error: "success" });
        });
    }
  });
});
app.get("/users/all", async (req, res) => {
  const AllUser = await LoginSchema.find();
  if (AllUser) {
    res.status(200).json({ message: "Success", User: AllUser });
  } else {
    res.status(400).json({ error: "error" });
  }
});
app.post("/meetings/new", async (req, res) => {
  const { uid1, uid2, date } = req.body;
  const UserIds = [uid1, uid2];

  const AllUser = await LoginSchema.find({
    _id: { $in: UserIds },
  });
  if (AllUser) {
    let Users = AllUser;
    const data = new MeetingSchema({
      Users,
      Date: date,
    });
    data
      .save()
      .then(() => {
        res.json({ message: "success", uid: ObjectId(data._id) });
      })
      .catch(() => {
        console.log("no data saved");
        res.json({ error: "success" });
      });
  } else {
    res.status(400).json({ error: "error" });
  }
});
app.get("/meetings/all", async (req, res) => {
  const AllMeeting = await MeetingSchema.find();
  if (AllMeeting) {
    res.status(200).json({ message: "Success", User: AllMeeting });
  } else {
    res.status(400).json({ error: "error" });
  }
});

app.listen(process.env.PORT || 3080, () => {
  console.log(`connection succesfull  ${process.env.PORT}`);
});

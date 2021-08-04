const jwtoken = require("jsonwebtoken");
const User = require("./UserSchema");
const authenticate = async (req, res, next) => {
  console.log(req.cookies.jwtverify);
  try {
    const token = req.cookies.jwtverify;
    const verifyToken = jwtoken.verify(token, process.env.SECRET);
    const rootUser = await User.findOne({
      _id: verifyToken._id,
    });

    if (!rootUser) {
      throw new Error("user not found");
    }
    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;
    next();
  } catch (err) {
    res.status(401).send("unautherised");
    console.log(err);
  }
};
module.exports = authenticate;

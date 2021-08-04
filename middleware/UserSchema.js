var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  Cpassword: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: "customer",
  },

  date: {
    type: Date,
    default: Date.now,
  },
  // messages: [
  //   {
  //     name: {
  //       type: String,
  //       required: true,
  //     },
  //     email: {
  //       type: String,
  //       required: true,
  //     },
  //     phone: {
  //       type: Number,
  //       required: true,
  //     },

  //     message: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.Cpassword = await bcrypt.hash(this.Cpassword, 12);
  }
  next();
});
userSchema.methods.generateToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};
userSchema.methods.addMessage = async function (name, email, phone, message) {
  try {
    this.messages = this.messages.concat({ name, email, phone, message });
    await this.save();
    return this.messages;
  } catch (err) {
    console.log(err);
  }
};
const User = mongoose.model("Logins", userSchema);
module.exports = User;

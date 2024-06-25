const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String,unique: true,},
  name: { type: String, required: true,},
  password: { type: String,},
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  profileImage: { type: String},
  email: { type: String, required: true, unique: true, },
  contact : {type : Number}
})

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);

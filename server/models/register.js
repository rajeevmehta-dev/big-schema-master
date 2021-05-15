/**
 * api/user.js
 * Defines the User model and exports a mongoose Schema
 */

const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  plan_type: {type:String, required:true},
  token:String

}, 
{
  timestamps: true
});

module.exports = mongoose.model('users', userSchema);
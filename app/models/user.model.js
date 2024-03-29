const mongoose = require('mongoose');
const User = mongoose.model('User', new mongoose.Schema({
  userName: String,
  email: String,
  passWord: String,
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }]
}))

module.exports = User;
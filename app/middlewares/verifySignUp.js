const db = require('../models')
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUserNameOrEmail = (req, res, next) => {
  User.findOne({
    userName: req.body.userName
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (user) {
      res.status(400).send({ message: 'Fail! user name is already in use!' });
      return;
    }

    // Email
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (user) {
        res.status(400).send({ message: "Failed! Email is already in use!" });
        return;
      }
      next();
    });
    // next();
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    req.body.roles.forEach(role => {
      if (!ROLES.includes(role)) {
        res.status(400).send({
          message: `Fail! Role ${role} does not exist!`
        });
        return;
      }
    });
  }
  next();
};

const verifySignUp = {
  checkDuplicateUserNameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;

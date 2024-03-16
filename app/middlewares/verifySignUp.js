const db = require('../models')
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUserNameOrEmail = async (req, res, next) => {
  if(!req.body.userName) {
    res.status(400).send({ message: 'Fail! user name can not be blank' });
    return;
  }
  try {
    const userWithName = await User.findOne({
      userName: req.body.userName
    }).exec();
    if (userWithName) {
      res.status(400).send({ message: 'Fail! user name is already in use!' });
      return;
    }
    const userWithEmail = await User.findOne({
      email: req.body.email
    }).exec();

    if (userWithEmail) {
      res.status(400).send({ message: "Failed! Email is already in use!" });
      return;
    }
    next();
    console.log('aaaaa')

  } catch (err) {
    res.status(500).send({ message: err });
  }
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

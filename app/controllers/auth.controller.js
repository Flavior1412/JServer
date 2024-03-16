const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      userName: req.body.userName
    }).populate("roles", "-__v")
      .exec();
    if (!user) {
      return res.status(404).send({ message: 'User not found!' });
    }
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid password!" });
    }

    const token = jwt.sign({ id: user.id },
      config.secret,
      {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      });

    const authorities = [];
    user.roles.forEach(role => {
      authorities.push(`ROLE_${role.name.toUpperCase()}`);
    })
    req.session.token = token;
    res.status(200).send({
      id: user._id,
      userName: user.userName,
      email: user.email,
      roles: authorities,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
}

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};

exports.signup = async (req, res) => {
  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  if (req.body.roles) {
    const roles = await Role.find({
      name: { $in: req.body.roles },
    });


    if (!roles) {
      res.status(500).send({ message: err });
      return;
    }

    user.roles = roles.map((role) => role._id);
    const newUser = await user.save();

    if (!newUser) {
      res.status(500).send({ message: 'user faile' });
      return;
    }

    res.send({ message: "User was registered successfully!" });
  } else {
    const role = await Role.findOne({ name: "user" });

    if (!role) {
      res.status(500).send({ message: err });
      return;
    }

    user.roles = [role._id];
    const newUser = await user.save();

    if (!newUser) {
      res.status(500).send({ message: 'user faile' });
      return;
    }

    res.send({ message: "User was registered successfully!" });
  };
}
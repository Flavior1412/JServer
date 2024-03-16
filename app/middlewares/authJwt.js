const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  const token = req.session.token;
  if (!token) {
    return res.status(403).send({ message: 'No token provided!' })
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }

    req.userId = decoded.indexOf;
    next();
  })
}

isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId).exec();
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    const roles = await Role.find({ _id: { $in: user.roles } });
    if (!roles) {
      return res.status(403).send({ message: 'Require admin role!' })
    }
    const adminRole = roles.findIndex(role => role.name === 'admin');
    return adminRole === -1 ?
      res.status(403).send({ message: 'Require admin role!' }) :
      next();
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const authJwt = {
  verifyToken,
  isAdmin
};

module.exports = authJwt;
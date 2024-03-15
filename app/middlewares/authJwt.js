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

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    Role.find(
      { _id: { $in: user.roles } },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err })
        }
        roles.forEach(role => {
          if (role.name === 'admin') {
            next();
            return;
          }
        })
        res.status(403).send({message: 'Require admin role!'})
        return;
      }
    );
  });
};

const authJwt ={
  verifyToken,
  isAdmin
};

module.exports = authJwt;
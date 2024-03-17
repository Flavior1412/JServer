const express = require('express');
const cors = require('cors');
const cookieSession = require('cookie-session');
const dbConfig = require("./app/config/db.config");
const db = require('./app/models');
const app = express();
const corsOptions = {
  credentials: true,
  origin: 'http://localhost:8081',
};

app.use(cors(corsOptions));
// app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "kira-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true
  })
);

const Role = db.role;
const mongoURI = `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`
db.mongoose
  .connect(mongoURI,{ useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  }).catch(err => {
    console.error("Connection error", err);
    process.exit();
  });


  // routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to kira application." });
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


function initial() {
  Role.estimatedDocumentCount()
    .then(count => {
      if (count === 0) {
        new Role({
          name: "user"
        }).save().then(console.log('added user')).catch(err=>{console.log(err)});

        new Role({
          name: "admin"
        }).save().then(console.log('added admin')).catch(err=>{console.log(err)});
      }

    }).catch(err=>{
      console.log(err)
    })
}

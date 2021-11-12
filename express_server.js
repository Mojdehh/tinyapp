const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const morgan = require("morgan");
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "1"
  }
};


const users = {
  "1": {
    id: "1",
    email: "test@yahoo.com",
    password: "123456"
  },
  "2": {
    id: "2",
    email: "test@gmail.com",
    password: "654321"
  }
};


// create a random alphanumeric string
const generateRandomString = function(len) {
  let str = Math.random().toString(36).substr(2, len);
  return str;
};


// Email lookup helper function
const getUserByEmail = function(email) {
  for (let key in users) {
    if (users[key].email === email) return users[key];
  }
};

// Function to store user's URLs
const urlsForUser = function(id) {
  const results = {};
  const keys = Object.keys(urlDatabase);
  for (let shortURL of keys) {
    const url = urlDatabase[shortURL];
    if (url.userID === id) {
      results[shortURL] = url;
    }
  }
  return results;
};


app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID);
  if (!userID) {
    return res.status(400).send('You must <a href="/login">login</a> first.');
  }
  const templateVars = {
    urls: userURLs,
    user: users[userID],
  };

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});


// Seperate page to show shortURL and edit longURL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const url = urlDatabase[req.params.shortURL];

  if (!url) {
    return res.status(404).send("URL not found!");
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: url.longURL,
    user: users[userID]
  };

  res.render("urls_show", templateVars);
});


// Registration page
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = {
    user: users[id]
  };
  if (user) {
    return res.redirect("/urls");
  }
  res.render("registration", templateVars);
});


// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("user_login", templateVars);
});


app.post("/urls", (req, res) => {
  //check if user is logged in
  const userID = req.session.user_id;
  if (userID) {
    const shortStr = generateRandomString(6);
    urlDatabase[shortStr] = {
      longURL: req.body.longURL,
      userID
    };
    res.redirect(`/urls/${shortStr}`);
  }
  res.redirect("/login");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});


// Login Handler
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = getUserByEmail(email);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (user) {
    // password check
    if (bcrypt.compareSync(user.password, hashedPassword)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      return res.status(403).send('Bad Request: Incorrect Password!');
    }
  } else {
    res.status(403).send('Bad Request: Email cannot be found!');
  }
});



//Registration handler
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('Email and/or Password cannot be empty!');
  }
  const user = getUserByEmail(req.body.email);
  if (user) {
    return res.status(400).send('User already exists!');
  } else {
    const userId = generateRandomString(5);
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    console.log(users);
    res.cookie('user_id', userId);
    res.redirect("/urls");
  }
});


//Logout Handler
app.post("/logout", (req, res) => {
  req.session.user_id = null; // clear cookies
  res.redirect("/urls");
});


app.listen(8080, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


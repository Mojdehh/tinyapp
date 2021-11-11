const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

// create a random alphanumeric string
const generateRandomString = function(len) {
  let str = Math.random().toString(36).substr(2, len);
  return str;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
};

// Email lookup helper function
const emailLookUp = function(em) {
  let counter = 0;
  for (let user in users) {
    if(users[user].email === em) counter++;
  }
  if (counter > 1) return true;
};


app.get("/urls", (req, res) => {
  const templateVars = {
    urls : urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

// create registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("registration", templateVars);
});


// create Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("user_login", templateVars);
});


app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortStr = generateRandomString(6);
  urlDatabase[shortStr] = req.body.longURL;
  res.redirect(`/urls/${shortStr}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userName = req.body.username;
  console.log(userName);
  res.cookie('username', userName);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


//create registration handler
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Bad Request: Username and/or Password cannot be empty!');
  } else if (emailLookUp(req.body.email)) {
    res.status(400).send('Bad Request: Email already exists!');
  } else {
    const userId = generateRandomString(5);
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: req.body.password
    };
    console.log(users);
    res.cookie('user_id', userId);
    res.redirect("/urls");
  }
});


app.listen(8080, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


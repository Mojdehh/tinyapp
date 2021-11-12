const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


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

//
// const urlsForUser = function(id) {
//   const results = {};
//   const keys = Object.keys(urlDatabase);
//   for (let shortURL of keys) {
//     const url = urlDatabase[shortURL]
//     if(url.userID === id) {
//       results[shortURL] = url;
//     }
//   }
//   return results;
// };

app.get("/urls", (req, res) => {
  const templateVars = {
    urls : urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});


// Registration page
app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
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
    user: users[req.cookies["user_id"]]
  };
  res.render("user_login", templateVars);
});


app.post("/urls", (req, res) => {
  //check if user is logged in
  if (req.cookies["user_id"]) {
    const shortStr = generateRandomString(6);
    urlDatabase[shortStr] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    };
    res.redirect(`/urls/${shortStr}`);
  }
  res.redirect("/login");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log(longURL);
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
  if (user) {
    // password check
    if (user.password === password) {
      res.cookie('user_id', user.id);
      res.redirect("/urls");
    } else {
      return res.status(403).send('Bad Request: Incorrect Password!');
    }
  } else {
    res.status(403).send('Bad Request: Email cannot be found!');
  }
});


//Logout Handler
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


//Registration handler
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('Bad Request: Email and/or Password cannot be empty!');
  }
  const user = getUserByEmail(req.body.email);
  if (user) {
    return res.status(400).send('Bad Request: Email already exists!');
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


const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.listen(8080, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//****************Data sets***************//
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "1"
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
//************************************//



//*******************GET endpoints*******************//

// Set homepage
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.redirect('/login');
});


app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID, urlDatabase);
  if (!userID) {
    return res.status(400).send('You are logged out! Please <a href="/login">login</a> or <a href="/register">register</a>.');
  }
  const templateVars = {
    urls: userURLs,
    user: users[userID],
  };

  res.render("urls_index", templateVars);
});



// Add new URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(404).send('You must <a href="/login">login</a> or <a href="/register">register</a> first.');
  }
  const templateVars = {
    user: users[userID]
  };
  res.render("urls_new", templateVars);
});



// Seperate page to show shortURL and edit longURL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const url = urlDatabase[req.params.shortURL];
  if (!userID) {
    return res.status(404).send('You are logged out! Please <a href="/login">login</a> or <a href="/register">register</a>.');
  }

  if (!url) {
    return res.status(404).send("URL not found!");
  }

  if (url) {
    if (url.userID !== userID) {
      return res.status(404).send("This URL belongs to someone else, you do not have permission to modify it!");
    }
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: url.longURL,
      user: users[userID]
    };
    res.render("urls_show", templateVars);
  }

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
  res.render("user_register", templateVars);
});



// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("user_login", templateVars);
});



app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("This URL is not in our data base!");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
//****************************************************//



//*******************POST endpoints*******************//

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
  return res.status(404).send('Please <a href="/login">login</a> or <a href="/register">register</a> first.');
});


// Delete a URL
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
  const user = getUserByEmail(email, users);
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



// Registration Handler
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('Email and/or Password cannot be empty!');
  }
  const user = getUserByEmail(req.body.email, users);
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
    req.session.user_id = userId;
    res.redirect("/urls");
  }
});



// Logout Handler
app.post("/logout", (req, res) => {
  req.session.user_id = null; // clear cookies
  res.redirect("/urls");
});
//***************************************************//


const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; 

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

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
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//HELPER FUNCTIONS FOR AUTHENTICATION:
const findUserByEmail = (email, users) => {
  for (const userID in users) {
    if (email === users[userID].email) {
  return users[userID];
}
  }
  return false;
};

const createUser = (email, password, users) => {
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };
  return id;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //JSON string representing the entire urlDatabase object
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);  //will print a = 1 on webpage
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);  //will have a reference error because a is not accessible here
 });

app.get("/register", (req, res) => {
  const templateVars = { user: null };
    
  res.render("register", templateVars); //displays the register page
});

app.post("/register", (req, res) => {
  // 1) extract user info from body of request using req.body
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password; //const {email, password } = req.body; <- destructuring SHORTFORM
  //console.log(id, email, password); shows me the random id generated and what is returned from the browser when an email/password is inputed
  // 2) check if user already exists
  const foundUser = findUserByEmail(email, users);
  if (foundUser) {
    return res.status(401).send('Sorry, that user is already in use!');
  } 
  // 3) did not find user (foundUser is false) so create a new user
  const userID = createUser(email, password, users);

  // 4) log the user. Ask browser to set a cookie with the newly generated userID
  res.cookie('user_id', userID);

  // 5) redirect to urls page (/'urls')
res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_id'];
  const loggedIn = users[userID];
  
  const temaplateVars = {
  user: loggedIn
};
  res.render("urls_new", temaplateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies['user_id'];
  const loggedIn = users[userID];

  const templateVars = { 
    shortURL: req.params.shortURL,   //this is b2xVn2
    longURL: urlDatabase[req.params.shortURL],  //this is lighthouselabs.ca
    user: loggedIn };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let newUrl = req.body.newUrl;
  urlDatabase[shortURL] = newUrl;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  const loggedIn = users[userID];

  const templateVars = { 
    urls: urlDatabase,
    user: loggedIn };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {  //when a post request is made to /urls redirect to urls/:shortURL
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);  //redirects to /urls/:shortURL
});

// app.get("/login", (req, res) => {
//   const templateVars = { user: null }; //login page assumes you're not already logged in so no user is logged
//   res.render('login', templateVars);
// });

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//*********************Server setup & Dependencies*********//
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const {
  findUserByEmail,
  authenticateUser,
  createUser,
  generateRandomString,
  urlsForUser
} = require('./helpers');
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['#$I%&BeLieve^*IN&%Miracles$#@!', 'Sesshomaru-sama is the greatest!'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set("view engine", "ejs");

//*******************DATABASE***************************//

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "CodingIsHard"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
};

const password1 = "purple-monkey-dinosaur";
const hashedPasswordUser1 = bcrypt.hashSync(password1, 10);
const password2 = 'abc';
const hashedPasswordUser2 = bcrypt.hashSync(password2, 10);
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPasswordUser1
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPasswordUser2
  }
};

//*************************************************//

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //JSON string representing the entire urlDatabase object
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");  //example of changing the formatting on server.js Don't do it here. Make an .ejs file to hold html formatting
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);  //will print a = 1 on webpage
});
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);  //will have a reference error because a is not accessible here
});

//*************************************************//

app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars); //displays the registeration page
});

app.post("/register", (req, res) => {
  // 1) extract user info from body of request using req.body
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);
  // 2) check if user already exists
  const foundUser = findUserByEmail(email, users);
  if (!email || !password) {
    return res.status(400).send('Please enter an email and password!');
  }
  if (foundUser) {
    res.status(401).send('Sorry, that user is already in use!');
    return;
  }
  // 3) did not find user (foundUser is false) so create a new user
  const userID = createUser(email, hashedPassword, users);
  // 4) log the user. Ask browser to set a cookie with the newly generated userID
  req.session.user_id = userID; //res.cookie('user_id', userID);
  // 5) redirect to urls homepage (/'urls')
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const templateVars = { user: null }; //login page assumes you're not already logged in so no user is logged
  res.render('login', templateVars);
});

app.post("/login", (req, res) => {
  //extract email+password from req.body
  const email = req.body.email;
  const password = req.body.password;
  //retrieve user from database using helper function
  const user = authenticateUser(email, password, users);
  // check if user exists, set the cookie and redirect to /urls/ homepage
  if (user) {
    req.session.user_id = user.id; //res.cookie('user_id', user.id);
    res.redirect('/urls');
    return;
  }
  //user is not authenticated -> send error
  res.status(401).send('Incorrect password or email!');
});

app.post("/logout", (req, res) => {
  req.session = null; //should clears cookie with press of logout button
  res.redirect('/login');
});

//*************************************************//
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = users[userID];
  
  const templateVars = {
    user: loggedIn
  };
  if (!loggedIn) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(401).send('This page does not exist');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = users[userID];
  if (!loggedIn) {
    return res.redirect('/urls');
  }
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send('This page does not exist');
    return;
  }
  if (urlDatabase[req.params.shortURL].userID !== userID) {
    res.status(403).send('<h2>HALT❗️</h2> <p>You cannot edit an url that is not yours!</p>');
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: loggedIn };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = users[userID];
  if (!loggedIn) {
     return res.redirect('/urls');
  }
  let shortURL = req.params.shortURL;
  let longURL = req.body.newURL;
  if (urlDatabase[shortURL].userID !== loggedIn.id) {
    return res.redirect('/urls');   
  }
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const loggedIn = users[userID];
  if (!loggedIn) {
    return res.status(401).send("You cannot delete this.")
  }
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(401).send("You cannot delete a link that is not yours.")
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id; 
  const loggedIn = users[userID];
  if (!loggedIn) {
    res.status(401).send("<h2>Hmmm...🤔</h2> <p>Looks like you need to <a href='/login'>login</a> to access this page.</p>");
  }
  const filteredURLs = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: filteredURLs,
    user: loggedIn
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {  
  const userID = req.session.user_id;
  //Generate random shortURL. Store the shortURL and longURL in urlDatabase 
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
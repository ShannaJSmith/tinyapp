//*********************Server setup & Dependencies*********//
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { findUserByEmail } = require('./helpers')
const app = express();
const PORT = 8080; 
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

//*******************DATABASE***************************//
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",  //OLD DATABASE. DELETE LATER
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

//console.log(urlDatabase)

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "abc"
  }
};
//****************HELPER FUNCTIONS*************//

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

// const findUserByEmail = (email, users) => {   <- MOVED TO HELPERS MODULE. DELETE LATER
//   for (const userID in users) {
//     if (email === users[userID].email) {
//   return users[userID];
//   }
// }
//   return false;
// };
//console.log(findUserByEmail('user2@example.com', users));

const createUser = (email, password, users) => {  //creates the randomly generated userID string for the inputted email/password
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password
  };
  return userID;
};
// console.log(createUser('bob@hotmail.com', 'abc', users)); --> prints the randomly generated ID
// console.log(users);  -->now the database includes the newly generated user info

const authenticateUser = (email, password, users) => {  //returns entire user info (id, email, password)
  const foundUser = findUserByEmail(email, users);
  if (foundUser && foundUser.password === password) {  
    return foundUser; // if matched log in
  } 
  return false; //if passwords don't match return error msg
};
//console.log(authenticateUser("ufgsgs", "dishwasher-funk", users)) //password or email doesn't match anything in the database so false


//*************************************************//

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

 //*************************************************//

app.get("/register", (req, res) => {
  const templateVars = { user: null };
    
  res.render("register", templateVars); //displays the register page
});

app.post("/register", (req, res) => {
  // 1) extract user info from body of request using req.body
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password; //"const {email, password } = req.body;" <- destructuring SHORTFORM
  //console.log(id, email, password); shows me the random id generated and what is returned from the browser when an email/password is inputed
  // 2) check if user already exists
  const foundUser = findUserByEmail(email, users);
  //console.log('foundUser:', foundUser);
  if (foundUser) {
    res.status(401).send('Sorry, that user is already in use!');
    return;
  }  
  if (!email || !password) {
    return res.status(400).send('Please enter an email and password!');
  }
  // 3) did not find user (foundUser is false) so create a new user
  const userID = createUser(email, password, users);

  // 4) log the user. Ask browser to set a cookie with the newly generated userID
  res.cookie('user_id', userID);

  // 5) redirect to urls page (/'urls')
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
 if (user) {
  res.cookie('user_id', user.id); 
  res.redirect('/urls'); 
  return;
}
  //user is not authenticated -> send error
  res.status(403).send('Incorrect password or email!');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');  //should clears cookie with press of logout button
  res.redirect('/login');
});

//*************************************************//
app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_id'];
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
  if (!loggedIn) {
    res.status(404)
    res.send('You must login before you can access this page')
  }
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


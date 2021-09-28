const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; 

app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,   //this is b2xVn2
    longURL: urlDatabase[req.params.shortURL] };  //this is lighthouselabs.ca
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let newUrl = req.body.newUrl;
  urlDatabase[shortURL] = newUrl;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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
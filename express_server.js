const express = require("express");
const app = express();
const PORT = 8080; 

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
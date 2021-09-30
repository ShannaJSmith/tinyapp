const bcrypt = require('bcryptjs');

const findUserByEmail = (email, users) => {  //returns user info if matched and false if new email is used
  for (const userID in users) {
    if (email === users[userID].email) {
  return users[userID];
  }
}
  return false;
};

const authenticateUser = (email, password, users) => {
  const foundUser = findUserByEmail(email, users);
  const suppliedPassword = password;
  const hashedPassword = foundUser.password;

  if (foundUser && bcrypt.compareSync(suppliedPassword, hashedPassword)) {
      return foundUser;
    }
  return false;
}
const generateRandomString = () => Math.random().toString(36).substring(2, 8);

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


module.exports = { findUserByEmail, authenticateUser, createUser, generateRandomString };
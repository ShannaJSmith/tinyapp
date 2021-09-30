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






// const authenticateUser = (email, password, users) => {  //returns entire user info (id, email, password)
//   const foundUser = findUserByEmail(email, users);

//   if (foundUser && foundUser.password === password) {
//     console.log(password)
//     return foundUser; // if matched log in
//   }
//   return false; //if passwords don't match return error msg
// };
//console.log(authenticateUser("ufgsgs", "dishwasher-funk", users)) //password or email doesn't match anything in the database so false

module.exports = { findUserByEmail, authenticateUser };
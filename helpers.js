//const bcrypt = require('bcryptjs');

const findUserByEmail = (email, users) => {  //returns user info if matched and false if new email is used
  for (const userID in users) {
    if (email === users[userID].email) {
  return users[userID];
  }
}
  return false;
};

module.exports = { findUserByEmail };
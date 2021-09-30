const findUserByEmail = (email, users) => {  //returns user info if matched, undefined if nothing inputed and false if new email used
  for (const userID in users) {
    if (email === users[userID].email) {
  return users[userID];
  }
}
  return false;
};

module.exports = { findUserByEmail };
const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    //assert.isObject(expectedOutput, user)
  });
  // it('a non-existent email should return undefined', function() {
  //   const user = findUserByEmail("randomnewemail@example.com", users)
  //   const expectedOutput = undefined;
  //   //assert.???(expectedOutput, user)
  // });
});
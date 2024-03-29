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
    password: "abc"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID"
    assert.strictEqual(user.id, expectedOutput);
  });
  it('a non-existent email should return false', function() {
    const user = findUserByEmail("randomnewemail@example.com", testUsers);
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  });
});



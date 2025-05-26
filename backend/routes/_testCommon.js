/**
 * I keep all our test helpers here.
 * 
 * I did some stuff to make testing easier:
 * 1. I made some test tokens we can use everywhere
 * 2. I added notes about what each token is for
 * 3. I kept the user IDs simple
 * 
 * These tokens help us test different user scenarios
 * without making new ones all the time
 */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

// I made these tokens to test user authentication
const u1Token = jwt.sign({ id: 1, username: "u1" }, SECRET_KEY);
const u2Token = jwt.sign({ id: 2, username: "u2" }, SECRET_KEY);
const u3Token = jwt.sign({ id: 3, username: "u3" }, SECRET_KEY);

module.exports = {
    u1Token,
    u2Token,
    u3Token
}; 
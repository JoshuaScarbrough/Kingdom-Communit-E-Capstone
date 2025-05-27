const express = require('express');
const router = new express.Router();
const db = require('../db.js');
const { createToken } = require("../helpers/tokens.js");

const User = require("../models/user");
const LatLon = require("../models/latLon.js");

// Test route to be sure were locked in
router.get('/', (req, res, next) => {
    res.send("Auth routes are working")
})

// The route for a user to Login / Recieve their JWT Token
router.post("/register", async function (req, res, next) {
    console.log("Register request body:", req.body);
  try {
    const user = req.body;  // <-- Expecting user data directly here

    if (!user || Object.keys(user).length === 0) {
      console.log("Register request body:", req.body);
      return res.status(400).json({ message: "Missing user data in request body" });
    }

    const { username, userPassword: password, userAddress: address } = user;

    if (!username) {
      console.log("Missing username:", req.body);
      return res.status(400).json({ message: "Please enter a Username" });
    }

    if (!password) {
      console.log("Missing password:", req.body);
      return res.status(400).json({ message: "Please enter a Password" });
    }

    // Validate address
    const coordinates = await LatLon.checkAddress(address);

    if (!coordinates) {
      console.log("Invalid address:", req.body);
      return res.status(400).json({ message: "Please enter a valid Address" });
    }

    // Register user
    const newUser = await User.register(username, password, address);

    if (!newUser) {
      console.log("Username already taken:", username);
      return res.status(400).json({ message: `The username ${username} has already been taken. Sorry try again!!` });
    }

    const registeredUser = newUser;
    const token = createToken(registeredUser);

    console.log("User registered:", registeredUser);
    res.status(201).json({ message: "User registered successfully", registeredUser, token });
  } catch (e) {
    return next(e);
  }
});

// The route for a user to Login / Recieve their JWT Token
router.post("/login", async function (req, res, next){

    // Gets the data from the body
    const {loginUser} = req.body;
    const username = loginUser.username;
    const password = loginUser.userPassword;

    try{
        const user = await User.authenticate(username, password);


        if(user === undefined){
            return res.json({message: 'The username / password is incorrect'})
        }else{
        // Token for User
        const token = createToken(user)
        res.status(200).json({message:'login successful', user, token})
        }
        
    }catch (e){
        console.log("failed")
        return next(e)
    }
})

module.exports = router
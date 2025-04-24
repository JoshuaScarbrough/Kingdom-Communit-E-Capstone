const express = require('express');
const router = new express.Router();
const { createToken } = require("../helpers/tokens")

const User = require("../models/user");

// Test route to be sure were locked in
router.get('/', (req, res, next) => {
    res.send("Register route is working")
})

// The route for registering a user
router.post("/register", async function (req, res, next){

    const {username, userPassword, firstName, lastName, userAddress} = req.body
    try{
        const newUser = await User.register(username, userPassword, firstName, lastName, userAddress);
        res.status(201).json({message: 'User registered successfully', user: newUser});

    }catch (e){
        return next(e)
    }

})

// The route for a user to Login / Recieve their JWT Token
router.post("/login", async function (req, res, next){

    const {username, userPassword} = req.body;
    try{
        const user = await User.authenticate(username, userPassword);
        const token = createToken(user)
        res.status(200).json({message:'login successful', user, token})
    }catch (e){
        return next(e)
    }
})

module.exports = router
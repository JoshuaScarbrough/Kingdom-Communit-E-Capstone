const express = require('express');
const router = new express.Router();
const db = require('../db.js')
const { createToken } = require("../helpers/tokens")

const User = require("../models/user");

// Test route to be sure were locked in
router.get('/', (req, res, next) => {
    res.send("Auth routes are working")
})

// The route for registering a user
router.post("/register", async function (req, res, next){

    const {username, userPassword, userAddress} = req.body
    try{
        const newUser = await User.register(username, userPassword, userAddress);


         const extractedValues = newUser.row.replace(/[()]/g, "").split(',');
                
                let registeredUser = await db.query(
                    `SELECT id, username FROM users WHERE username = $1`,
                    [extractedValues[0]]
                )
                
                registeredUser = registeredUser.rows[0]
        
        // Token for User
        const token = createToken(registeredUser)
        res.status(201).json({message: 'User registered successfully', registeredUser, token});

    }catch (e){
        return next(e)
    }

})

// The route for a user to Login / Recieve their JWT Token
router.post("/login", async function (req, res, next){

    const {username, userPassword} = req.body;
    try{
        const user = await User.authenticate(username, userPassword);
        
        // Token for User
        const token = createToken(user)
        res.status(200).json({message:'login successful', user, token})
    }catch (e){
        return next(e)
    }
})

module.exports = router
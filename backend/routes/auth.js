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

// The route for registering a user
router.post("/register", async function (req, res, next){

    const {user} = req.body
    console.log(user)

    try{

        // Checks to make sure the address is valid
        const coordinates = await LatLon.checkAddress(user.userAddress)
        // console.log(coordinates)

        if(coordinates){

            // Registers the user
            const newUser = await User.register(user.username, user.userPassword, user.userAddress);


            const extractedValues = newUser.row.replace(/[()]/g, "").split(',');
                
                let registeredUser = await db.query(
                    `SELECT id, username FROM users WHERE username = $1`,
                    [extractedValues[0]]
                )
                
                registeredUser = registeredUser.rows[0]
        
        // Token for User
        const token = createToken(registeredUser)
        res.status(201).json({message: 'User registered successfully', registeredUser, token});
        }else{
            return res.json({message: "Please enter a valid Address"})
        }

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
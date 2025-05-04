const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens")
const { SECRET_KEY } = require("../config")
const User = require("../models/user");

// Test route to make sure all users are inside of the database
router.get('/', async function getAllUsers (req, res, next){
    try {
        const results = await db.query(
            'SELECT * FROM users'
        );
        return res.json(results.rows)
    } catch (e) {
        return next (e);
    }
})

// Welcome the user once they have logged into the site
// * Need to insert API Call for the uplifting quote*
router.get('/:id', async function getUser (req, res, next){
    try {
        const {token} = req.body;
        const data = jwt.verify(token, SECRET_KEY);

        if(data){
            // Need to move this into the Models folder
            const results = await db.query(
                `SELECT * FROM users WHERE username = $1`, 
                [data.username]
            )

            const user = results.rows[0]

            return res.json({msg: `Welcome to the Kingdom ${user.username}`})
        }
    } catch (e) {
        return next (e);
    }
})

/**
 * Route that shows a Users homepage where they see their:
 * username, bio, coverPhoto, profilePic
 */
router.get('/:id/homepage', async function homepage (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            // Selects the user
            const user = await User.get(data.id)

            // Selects all of the posts regardless of type
            const allPosts = await User.getAllPosts(user.id)
    
            return res.json({
                user: `${user.username},${user.bio}, ${user.profilepictureurl}, ${user.coverphotourl}`, 
                allPosts: allPosts
            })
    
        }

    }catch (e) {
        return next (e);
    }

})

// Route to edit / update a user (Not their photos)
router.patch("/:id/update", async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        // If a valid Token
        if(data){

            // Selects the existing user
            const results = await db.query('SELECT * FROM users WHERE username = $1', [data.username])
            const currentUser = results.rows[0];

            // Uses spread notation to get the values for the current user and any value inserted into the req.body
            // This is incase user doesn't fill out all fields
            const update = { ...currentUser, ...req.body}

            //Updates the user
            const updatedResults = await db.query(
                'UPDATE users SET username = $1, bio = $2, useraddress = $3 WHERE username = $4 RETURNING username, bio, useraddress',
                [update.username, update.bio, update.useraddress, data.username]
            )

            const updatedUser = updatedResults.rows[0]

            // Creates a new Token for the user due to the update
            let newToken = await db.query(
                `SELECT id, username FROM users WHERE username = $1`,
                [updatedUser.username]
            )
            
            newToken = newToken.rows[0];

            const token = createToken(newToken)
            return res.json({msg: `User ${updatedUser.username} has been updated!`, user: updatedUser, token})

        }

    }catch (e){
        return next(e)
    }


})

// Route to edit / update a user (Not their photos)
router.patch("/:id/updatePhotos", async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){

           // Selects the existing user
           const results = await db.query('SELECT * FROM users WHERE username = $1', [data.username])
           const currentUser = results.rows[0];

           // Uses spread notation to get the values for the current user and any value inserted into the req.body
           // This is incase user doesn't fill out all fields
           const update = { ...currentUser, ...req.body}

           //Updates the user
           const updatedResults = await db.query(
               'UPDATE users SET profilepictureurl = $1, coverphotourl = $2 WHERE username = $3',
               [update.profilepictureurl, update.coverphotourl, currentUser.username]
           )

           const updatedUser = updatedResults.rows[0]
           return res.json({msg: `User ${updatedUser.username} picture has been updated!`, user: updatedUser})

        }

    }catch (e){
        return next(e)
    }


})



module.exports = router;
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
            // Need to move this into the Models folder
            const results = await db.query(
                `SELECT * FROM users WHERE username = $1`, 
                [data.username]
            )
    
            const user = results.rows[0]
            console.log(user)
    
            return res.json({user: `${user.username},${user.bio}, ${user.profilepictureurl}, ${user.coverphotourl}`})
    
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
           console.log(data.username)
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

router.post('/:id/follow', async function followUser(req,res,next){ // followUser is the function that follows a user
    try{
        const { token } = req.body; // token is the token that is being used to follow a user
        const data = jwt.verify(token, SECRET_KEY);  // data is the data that is being used to follow a user
        const following_id = req.params.id; // following_id is the id of the user that is being followed

        if(data){
            const user = await db.query( // user is the user that is being followed
                `SELECT id FROM users WHERE username = $1`, // select the id of the user that is being followed
                [data.username] // select the id of the user that is being followed
            )
            const follower_id = user.rows[0].id; // follower_id is the id of the user that is following 

            const result = await User.followUser(follower_id, following_id); // result is the result of the followUser Function 
            return res.json({message: "Successfully followed user", result}); // return the result of the followUser Function
        }
    }catch (e){ // catch the error
        return next(e); // return the error
    }
});



module.exports = router;
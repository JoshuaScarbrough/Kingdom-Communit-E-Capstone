const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens")
const { SECRET_KEY } = require("../config")
const User = require("../models/user");
const { user } = require('pg/lib/defaults');

// Gets one Specific User
router.post('/', async function getAllUsers (req, res, next){

    try{
        
        const {id} = req.body

        let user = await db.query(
            `SELECT * FROM users WHERE id=$1`, [id]
        )
        user = user.rows
        console.log(`Supposed to be the user ${user}`)

        return res.json(user)

    }catch(e){
        next(e)
    }
})

// Welcome the user once they have logged into the site
// * Need to insert API Call for the uplifting quote*
router.post('/:id', async function getUser (req, res, next){
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

            return res.json({msg: `Welcome to the Kingdom ${user.username}`, user: user})
        }
    } catch (e) {
        return next (e);
    }
})

/**
 * Route that shows a Users homepage where they see their:
 * username, bio, coverPhoto, profilePic
 */
router.post('/:id/homepage', async function homepage (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    try{

        if(data){
            // Selects the user
            const user = await User.get(data.id)

            // Gets all the user info so that it can be used in React
            const username = user.username
            const bio = user.bio
            const profilePic = user.profilepictureurl
            const coverPhoto = user.coverphotourl

            // Selects all of the posts regardless of type
            const allPosts = await User.getAllPosts(user.id)

            // Gets all the data for the posts, events, urgentPosts
            const posts = allPosts.posts
            const events = allPosts.events
            const urgentPosts = allPosts.urgentPosts
    
            return res.json({
                user: {
                    username: username,
                    bio: bio,
                    profilePic: profilePic,
                    coverPhoto: coverPhoto
                }, 
                allPosts: {
                    posts: posts,
                    events: events,
                    urgentPosts: urgentPosts
                }
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
            console.log(update)
            const userUpdated = update.updatedUser

            //Updates the user
            const updatedResults = await db.query(
                'UPDATE users SET username = $1, bio = $2, useraddress = $3 WHERE id = $4 RETURNING username, bio, useraddress',
                [userUpdated.username, userUpdated.bio, userUpdated.address, data.id]
            )

            const updatedUser = updatedResults.rows[0]
            // Creates a new Token for the user due to the update
            let newToken = await db.query(
                `SELECT id, username FROM users WHERE username = $1`,
                [updatedUser.username]
            )
            
            newToken = newToken.rows[0];

            const token = createToken(newToken)
            return res.json({message: `User ${updatedUser.username} has been updated!`, user: updatedUser, token})

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
           console.log(currentUser)

           // Uses spread notation to get the values for the current user and any value inserted into the req.body
           // This is incase user doesn't fill out all fields
           const update = { ...currentUser, ...req.body}
           const userUpdated = update.updatedUser
           console.log("Look Here", userUpdated)

           //Updates the user
           const updatedResults = await db.query(
               'UPDATE users SET profilepictureurl = $1, coverphotourl = $2 WHERE username = $3',
               [userUpdated.profilePicture, userUpdated.coverPhoto, currentUser.username]
           )

           const updatedUser = updatedResults.rows[0]
           // Creates a new Token for the user due to the update
           let newToken = await db.query(
            `SELECT id, username FROM users WHERE username = $1`,
            [currentUser.username]
            )

            newToken = newToken.rows[0];

            const token = createToken(newToken)
            return res.json({message: `Users pictures have been updated!`, user: updatedUser, token})

        }

    }catch (e){
        return next(e)
    }


})



module.exports = router;
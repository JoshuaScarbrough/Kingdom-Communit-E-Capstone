const express = require('express');
const router = express.Router();
const db = require('../db')
const jwt = require("jsonwebtoken");

const { createToken } = require("../helpers/tokens")
const { SECRET_KEY } = require("../config")
const User = require("../models/user");

router.get('/', async function (req, res, next){
    res.send('Follower/Following route working')
})

// Route that shows all followers a user has
router.get('/:id/followers', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    if(data){

        // Selects the user
        const user = await User.get(data.id);

        // Query string to select all the users followers
        const results = await db.query(
            `SELECT users.username 
            FROM users 
            JOIN followers ON users.id = followers.follower_id
            WHERE followers.following_id = $1`,
            [user.id]
        )

        const followers = results.rows
        res.send({msg: "List of all followers", followers: followers})
    }
})

// Route that shows all the users a user is following
router.get('/:id/following', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    if(data){

        // Selects the user
        const user = await User.get(data.id);

        // Query string to select all the users a user is following
        const results = await db.query(
            `SELECT users.username 
            FROM users 
            JOIN followers ON users.id = followers.following_id
            WHERE followers.follower_id = $1`,
            [user.id]
        )

        const following = results.rows
        res.send({msg: `List of all users ${user.username} is following`, following: following})
    }
})

// Route that allows a user to follow 
router.post('/:id/addUser', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    if(data){

        const {following_User_ID} = req.body;

        // Allows the user to follow another user
        const addUser = await User.followUser(data.id, following_User_ID);

        res.send(addUser)

    }
})

// Route that allows you to stop following someone
router.delete('/:id/unfollow', async function (req, res, next){
    const {token} = req.body;
    const data = jwt.verify(token, SECRET_KEY);

    if(data){
        // user that you want to unfollow
        const {following_id} = req.body

        let unfollow = await db.query(
            `DELETE FROM followers WHERE follower_id = $1 AND following_id = $2`,
            [data.id, following_id]
        )
        
        res.send({message: `Successfully unfollowed user `})

    }
})


module.exports = router